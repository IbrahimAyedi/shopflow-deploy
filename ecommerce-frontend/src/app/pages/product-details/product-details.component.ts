import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService, resolveImageUrl } from '../../core/services/product.service';
import { ReviewService } from '../../core/services/review.service';
import { Product } from '../../models/product.models';
import { ReviewResponse, ReviewRequest } from '../../models/review.models';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  addingToCart = false;
  errorMessage = '';
  cartMessage = '';
  cartErrorMessage = '';

  reviews: ReviewResponse[] = [];
  loadingReviews = false;
  
  newReviewRating = 5;
  newReviewComment = '';
  submittingReview = false;
  reviewError = '';
  reviewSuccess = '';
  hoverRating = 0;
  resolveImageUrl = resolveImageUrl;

  setRating(star: number, event: Event): void {
    event.preventDefault();
    this.newReviewRating = star;
  }

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private reviewService: ReviewService
  ) {}

  // Reads the product ID from the URL and loads the product and its reviews.
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage = 'Product id is invalid.';
      return;
    }

    this.loadProduct(id);
  }

  get isCustomer(): boolean {
    return this.authService.isCustomer();
  }

  // Loads the full product data and triggers loading of its approved reviews.
  loadProduct(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: product => {
        this.product = product;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load product');
        this.loading = false;
      }
    });

    this.loadReviews(id);
  }

  // Loads all approved reviews for this product from the backend.
  loadReviews(productId: number): void {
    this.loadingReviews = true;
    this.reviewService.getProductReviews(productId).subscribe({
      next: reviews => {
        this.reviews = reviews;
        this.loadingReviews = false;
      },
      error: () => {
        this.loadingReviews = false;
      }
    });
  }

  // Submits a new review for this product; it will require admin approval before appearing.
  submitReview(): void {
    if (!this.product) return;
    
    this.submittingReview = true;
    this.reviewError = '';
    this.reviewSuccess = '';

    const request: ReviewRequest = {
      productId: this.product.id,
      note: this.newReviewRating,
      commentaire: this.newReviewComment
    };

    this.reviewService.addReview(request).subscribe({
      next: (review) => {
        this.reviewSuccess = 'Review submitted successfully. It may need approval before appearing.';
        this.newReviewComment = '';
        this.newReviewRating = 5;
        this.submittingReview = false;
        
        // If it's already approved (unlikely based on backend default but possible)
        if (review.approuve) {
          this.reviews.unshift(review);
        }
      },
      error: (error) => {
        this.reviewError = this.getErrorMessage(error, 'Failed to submit review. You must purchase the product first.');
        this.submittingReview = false;
      }
    });
  }

  // Adds this product to the cart; only available to CUSTOMER role users.
  addToCart(product: Product): void {
    this.cartMessage = '';
    this.cartErrorMessage = '';

    if (!this.authService.isCustomer()) {
      this.cartErrorMessage = 'Only customers can add products to cart.';
      return;
    }

    this.addingToCart = true;

    this.cartService.addItem({
      productId: product.id,
      variantId: null,
      quantite: 1
    }).subscribe({
      next: () => {
        this.cartMessage = `${product.name} added to cart.`;
        this.addingToCart = false;
      },
      error: error => {
        this.cartErrorMessage = this.getErrorMessage(error, 'Failed to add item to cart');
        this.addingToCart = false;
      }
    });
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        return 'Only customers can add products to cart.';
      }

      const apiError = error.error as { message?: string; details?: Record<string, string> } | null;

      if (apiError?.message) {
        return this.formatApiError(apiError.message, apiError.details);
      }
    }

    return fallbackMessage;
  }

  private formatApiError(message: string, details?: Record<string, string>): string {
    if (!details) {
      return message;
    }

    const detailMessages = Object.values(details);
    return detailMessages.length > 0 ? `${message}: ${detailMessages.join(', ')}` : message;
  }

  getDiscountPercentage(product: Product): number {
    if (!product.prixPromo || !product.price) {
      return 0;
    }
    return Math.round(((product.price - product.prixPromo) / product.price) * 100);
  }
}

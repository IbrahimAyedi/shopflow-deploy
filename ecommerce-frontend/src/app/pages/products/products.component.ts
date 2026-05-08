import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService, resolveImageUrl } from '../../core/services/product.service';
import { Category } from '../../models/category.models';
import { Product } from '../../models/product.models';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  searchTerm = '';
  maxPrice: number | null = null;
  minRating: number | null = null;
  activeOnly = false;
  selectedCategoryId: number | null = null;
  loading = false;
  errorMessage = '';
  cartMessage = '';
  cartErrorMessage = '';
  addingProductId: number | null = null;
  resolveImageUrl = resolveImageUrl;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // Initializes the page: reads the search query from the URL, then loads products and categories.
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] ?? '';
    });
    this.loadProducts();
    this.categoryService.getCategories().subscribe({
      next: cats => { this.categories = cats; },
      error: () => { /* categories optional — fail silently */ }
    });
  }

  get isCustomer(): boolean {
    return this.authService.isCustomer();
  }

  // Returns the product list after applying all active client-side filters (search, price, rating, category).
  get filteredProducts(): Product[] {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    return this.products.filter(product => {
      const nameMatch = !normalizedSearch || product.name.toLowerCase().includes(normalizedSearch);
      const priceMatch = this.maxPrice === null || product.price <= this.maxPrice;
      const ratingMatch = this.minRating === null || (product.note != null && product.note >= this.minRating);
      const activeMatch = !this.activeOnly || product.actif === true;
      // categoryIds is populated by backend only when that field is added to ProductResponse;
      // until then, undefined means "no category data" → do not exclude the product.
      const categoryMatch = this.selectedCategoryId === null
        || (product.categoryIds != null && product.categoryIds.includes(this.selectedCategoryId));
      return nameMatch && priceMatch && ratingMatch && activeMatch && categoryMatch;
    });
  }

  get hasProducts(): boolean {
    return this.products.length > 0;
  }

  // Fetches all available products from the backend and stores them for filtering.
  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error);
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.maxPrice = null;
    this.minRating = null;
    this.activeOnly = false;
    this.selectedCategoryId = null;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null },
      queryParamsHandling: 'merge'
    });
  }

  // Adds the selected product to the customer's cart (quantity 1).
  onAddToCart(product: Product): void {
    if (this.addingProductId !== null) {
      return;
    }

    this.cartMessage = '';
    this.cartErrorMessage = '';
    this.addingProductId = product.id;

    this.cartService.addItem({
      productId: product.id,
      variantId: null,
      quantite: 1
    }).subscribe({
      next: () => {
        this.cartMessage = `${product.name} added to cart.`;
        this.addingProductId = null;
      },
      error: error => {
        this.cartErrorMessage = this.getCartErrorMessage(error, 'Failed to add item to cart');
        this.addingProductId = null;
      }
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as { message?: string } | null;

      if (apiError?.message) {
        return apiError.message;
      }
    }

    return 'Failed to load products';
  }

  private getCartErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        return 'Only customers can add products to cart. Please login with a customer account.';
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
}

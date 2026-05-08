import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { ProductService, resolveImageUrl } from '../../core/services/product.service';
import { Product } from '../../models/product.models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  errorMessage = '';

  resolveImageUrl = resolveImageUrl;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get featuredProducts(): Product[] {
    return this.products.slice(0, 3);
  }

  get hasFeaturedProducts(): boolean {
    return this.featuredProducts.length > 0;
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load featured products');
        this.loading = false;
      }
    });
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as { message?: string } | null;

      if (apiError?.message) {
        return apiError.message;
      }
    }

    return fallbackMessage;
  }
}

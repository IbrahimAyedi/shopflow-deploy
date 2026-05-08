import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { CartService } from '../../core/services/cart.service';
import { Cart, CartItem } from '../../models/cart.models';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  errorMessage = '';
  actionMessage = '';
  actionErrorMessage = '';
  couponCode = '';
  updatingItemId: number | null = null;
  removingItemId: number | null = null;
  applyingCoupon = false;
  removingCoupon = false;
  itemQuantities: Record<number, number> = {};

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  get cartItems(): CartItem[] {
    return this.cart?.items ?? this.cart?.lignes ?? this.cart?.cartItems ?? [];
  }

  get hasItems(): boolean {
    return this.cartItems.length > 0;
  }

  // Fetches the current customer's cart and initializes the quantity inputs.
  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';
    this.actionMessage = '';
    this.actionErrorMessage = '';

    this.cartService.getCart().subscribe({
      next: cart => {
        this.setCart(cart);
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load cart');
        this.loading = false;
      }
    });
  }

  // Sends an updated quantity for a cart item to the backend and refreshes the cart.
  updateItemQuantity(item: CartItem): void {
    const quantite = this.itemQuantities[item.id];

    if (!quantite || quantite < 1) {
      this.actionErrorMessage = 'Quantity must be at least 1';
      return;
    }

    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.updatingItemId = item.id;

    this.cartService.updateItemQuantity(item.id, quantite).subscribe({
      next: cart => {
        this.setCart(cart);
        this.actionMessage = 'Cart item updated.';
        this.updatingItemId = null;
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to update item');
        this.updatingItemId = null;
      }
    });
  }

  // Removes a single item from the cart and refreshes the cart totals.
  removeItem(item: CartItem): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.removingItemId = item.id;

    this.cartService.removeItem(item.id).subscribe({
      next: cart => {
        this.setCart(cart);
        this.actionMessage = 'Cart item removed.';
        this.removingItemId = null;
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to remove item');
        this.removingItemId = null;
      }
    });
  }

  // Applies the entered coupon code to the cart and refreshes the discount and totals.
  applyCoupon(): void {
    const code = this.couponCode.trim();

    if (!code) {
      this.actionErrorMessage = 'Coupon code is required';
      return;
    }

    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.applyingCoupon = true;

    this.cartService.applyCoupon(code).subscribe({
      next: cart => {
        this.setCart(cart);
        this.actionMessage = 'Coupon applied.';
        this.couponCode = '';
        this.applyingCoupon = false;
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to apply coupon');
        this.applyingCoupon = false;
      }
    });
  }

  removeCoupon(): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.removingCoupon = true;

    this.cartService.removeCoupon().subscribe({
      next: cart => {
        this.setCart(cart);
        this.actionMessage = 'Coupon removed.';
        this.removingCoupon = false;
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to remove coupon');
        this.removingCoupon = false;
      }
    });
  }

  getProductName(item: CartItem): string {
    return item.productName ?? item.nomProduit ?? item.productNom ?? `Product #${item.productId ?? item.id}`;
  }

  getQuantity(item: CartItem): number {
    return item.quantite ?? item.quantity ?? 0;
  }

  getUnitPrice(item: CartItem): number | null {
    return item.prixUnitaire ?? item.unitPrice ?? null;
  }

  getLineTotal(item: CartItem): number | null {
    return item.sousTotal ?? item.total ?? item.totalPrice ?? null;
  }

  // Stores the updated cart and rebuilds the quantity input map (one entry per item id).
  private setCart(cart: Cart): void {
    this.cart = cart;
    this.itemQuantities = {};

    for (const item of this.cartItems) {
      this.itemQuantities[item.id] = this.getQuantity(item);
    }
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
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

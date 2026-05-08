import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { OrderService } from '../../core/services/order.service';
import { Order, OrderItem, PaymentMethod } from '../../models/order.models';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  errorMessage = '';
  actionMessage = '';
  actionErrorMessage = '';
  cancellingOrderId: number | null = null;
  paymentOrderId: number | null = null;
  page = 0;
  size = 10;
  totalElements = 0;

  paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'ESPECE', label: 'Espèce (Cash)' },
    { value: 'CARTE', label: 'Carte (Card)' },
    { value: 'CHEQUE', label: 'Chèque (Check)' }
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  get hasOrders(): boolean {
    return this.orders.length > 0;
  }

  // Loads the current customer's paginated order history from the backend.
  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    this.actionMessage = '';
    this.actionErrorMessage = '';

    this.orderService.getMyOrders(this.page, this.size).subscribe({
      next: response => {
        this.orders = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load orders');
        this.loading = false;
      }
    });
  }

  // Cancels the given order and reloads the order list to reflect the status change.
  cancelOrder(order: Order): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.cancellingOrderId = order.id;

    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        this.actionMessage = 'Order cancelled.';
        this.cancellingOrderId = null;
        this.loadOrders();
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to cancel order');
        this.cancellingOrderId = null;
      }
    });
  }

  // Saves the customer's chosen payment method (cash, card, or cheque) for a PROCESSING order.
  selectPaymentMethod(order: Order, method: PaymentMethod): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.paymentOrderId = order.id;

    this.orderService.selectPaymentMethod(order.id, method).subscribe({
      next: (updated) => {
        order.paymentMethod = updated.paymentMethod;
        this.actionMessage = `Payment method set to ${method}.`;
        this.paymentOrderId = null;
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to set payment method');
        this.paymentOrderId = null;
      }
    });
  }

  // Returns true if the order is still cancellable (PENDING or PAID status).
  canCancel(order: Order): boolean {
    const status = this.getStatus(order);
    return status === 'PENDING' || status === 'PAID';
  }

  // Returns true if the payment method selector should be shown (PROCESSING and no method chosen yet).
  canSelectPayment(order: Order): boolean {
    return this.getStatus(order) === 'PROCESSING' && !order.paymentMethod;
  }

  getOrderNumber(order: Order): string {
    return order.numeroCommande ?? order.orderNumber ?? `Order #${order.id}`;
  }

  getStatus(order: Order): string {
    return order.statut ?? order.status ?? 'UNKNOWN';
  }

  getDate(order: Order): string {
    return order.dateCommande ?? order.createdAt ?? '';
  }

  getTotal(order: Order): number {
    return order.totalTTC ?? order.total ?? 0;
  }

  getItems(order: Order): OrderItem[] {
    return order.items ?? order.orderItems ?? [];
  }

  getProductName(item: OrderItem): string {
    return item.productName ?? item.productNom ?? `Product #${item.productId ?? ''}`;
  }

  getQuantity(item: OrderItem): number {
    return item.quantite ?? item.quantity ?? 0;
  }

  getItemTotal(item: OrderItem): number | null {
    return item.sousTotal ?? item.total ?? null;
  }

  getPaymentLabel(method: PaymentMethod | null | undefined): string {
    if (!method) return '';
    const found = this.paymentMethods.find(m => m.value === method);
    return found ? found.label : method;
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

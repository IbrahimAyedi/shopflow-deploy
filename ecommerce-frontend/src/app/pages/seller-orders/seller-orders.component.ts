import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../models/order.models';

@Component({
  selector: 'app-seller-orders',
  templateUrl: './seller-orders.component.html',
  styleUrls: ['./seller-orders.component.css']
})
export class SellerOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';
  actionMessage = '';
  processingOrderId: number | null = null;

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';
    this.actionMessage = '';
    this.orderService.getSellerOrders(0, 100).subscribe({
      next: (res) => {
        this.orders = res.content;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load orders.';
        this.loading = false;
      }
    });
  }

  getStatus(order: Order): string {
    return order.statut ?? order.status ?? 'UNKNOWN';
  }

  isPending(order: Order): boolean {
    return this.getStatus(order) === 'PENDING';
  }

  acceptOrder(order: Order): void {
    if (!window.confirm(`Accept order #${order.numeroCommande || order.id}? This cannot be undone.`)) {
      return;
    }

    this.processingOrderId = order.id;
    this.actionMessage = '';
    this.error = '';

    this.orderService.acceptOrder(order.id).subscribe({
      next: (updated) => {
        order.statut = updated.statut;
        order.status = updated.status;
        this.actionMessage = `Order #${order.numeroCommande || order.id} accepted.`;
        this.processingOrderId = null;
      },
      error: () => {
        this.error = 'Failed to accept order.';
        this.processingOrderId = null;
      }
    });
  }

  rejectOrder(order: Order): void {
    if (!window.confirm(`Reject order #${order.numeroCommande || order.id}? This action cannot be undone.`)) {
      return;
    }

    this.processingOrderId = order.id;
    this.actionMessage = '';
    this.error = '';

    this.orderService.rejectOrder(order.id).subscribe({
      next: (updated) => {
        order.statut = updated.statut;
        order.status = updated.status;
        this.actionMessage = `Order #${order.numeroCommande || order.id} rejected.`;
        this.processingOrderId = null;
      },
      error: () => {
        this.error = 'Failed to reject order.';
        this.processingOrderId = null;
      }
    });
  }
}

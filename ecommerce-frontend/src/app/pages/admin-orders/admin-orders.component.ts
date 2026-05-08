import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../models/order.models';

interface OrderAction {
  label: string;
  status: string;
  className: string;
  isDestructive: boolean;
}

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';
  actionMessage = '';
  actionError = '';
  processingOrderId: number | null = null;

  readonly terminalStatuses = ['DELIVERED', 'CANCELLED', 'REFUNDED'];

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  // Fetches all orders in the system (up to 100 at once) for admin management.
  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders(0, 100).subscribe({
      next: (res) => {
        this.orders = res.content;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders.';
        this.loading = false;
      }
    });
  }

  getStatus(order: Order): string {
    return order.statut ?? order.status ?? 'UNKNOWN';
  }

  isTerminalStatus(status: string): boolean {
    return this.terminalStatuses.includes(status);
  }

  // Returns the available action buttons for an order based on its current status.
  getOrderActions(order: Order): OrderAction[] {
    const currentStatus = this.getStatus(order);

    const actions: { [key: string]: OrderAction[] } = {
      PENDING: [
        { label: '→ Processing', status: 'PROCESSING', className: 'btn-primary', isDestructive: false },
        { label: '✕ Cancel', status: 'CANCELLED', className: 'btn-danger', isDestructive: true }
      ],
      PROCESSING: [
        { label: '→ Shipped', status: 'SHIPPED', className: 'btn-primary', isDestructive: false },
        { label: '✕ Cancel', status: 'CANCELLED', className: 'btn-danger', isDestructive: true }
      ],
      PAID: [
        { label: '→ Shipped', status: 'SHIPPED', className: 'btn-primary', isDestructive: false },
        { label: '↻ Refund', status: 'REFUNDED', className: 'btn-warning', isDestructive: true }
      ],
      SHIPPED: [
        { label: '✓ Delivered', status: 'DELIVERED', className: 'btn-success', isDestructive: false }
      ]
    };

    return actions[currentStatus] || [];
  }

  // Updates the order status after confirming with the admin; destructive actions require extra confirmation.
  updateOrderStatus(order: Order, action: OrderAction): void {
    const confirmMessage = action.isDestructive
      ? `Are you sure you want to mark this order as ${action.status}? This action cannot be undone.`
      : `Update order to ${action.status}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    this.processingOrderId = order.id;
    this.actionMessage = '';
    this.actionError = '';

    this.orderService.updateOrderStatus(order.id, action.status).subscribe({
      next: (updated) => {
        order.statut = updated.statut;
        order.status = updated.status;
        this.actionMessage = `Order ${order.numeroCommande || order.id} updated to ${action.status}.`;
        this.processingOrderId = null;
      },
      error: () => {
        this.actionError = 'Failed to update order status.';
        this.processingOrderId = null;
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';

import { DashboardService } from '../../core/services/dashboard.service';
import { SellerDashboard } from '../../models/dashboard.models';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  dashboard: SellerDashboard | null = null;
  loading = true;
  error: string | null = null;

  readonly quickActions = [
    { label: 'Add Product',    route: '/seller/products', icon: '＋', primary: true  },
    { label: 'View Orders',    route: '/seller/orders',   icon: '📦', primary: false },
    { label: 'My Profile',     route: '/seller/profile',  icon: '🏪', primary: false },
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getSellerDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = (err?.error?.message as string | undefined) ?? 'Failed to load dashboard data.';
        this.loading = false;
      }
    });
  }

  stockBadgeClass(qty: number | undefined): string {
    if (qty == null || qty === 0) return 'status-danger';
    if (qty <= 2) return 'status-danger';
    if (qty <= 4) return 'status-warning';
    return 'status-success';
  }

  stockLabel(qty: number | undefined): string {
    if (qty == null) return '—';
    if (qty === 0)   return 'Out of stock';
    if (qty <= 2)    return `${qty} — Critical`;
    if (qty <= 4)    return `${qty} — Low`;
    return String(qty);
  }
}

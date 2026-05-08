import { Component, OnInit } from '@angular/core';

import { DashboardService } from '../../core/services/dashboard.service';
import { AdminDashboard } from '../../models/dashboard.models';

interface ChartMetric {
  label: string;
  value: number;
  pct: number;
  colorVar: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  dashboard: AdminDashboard | null = null;
  loading = true;
  error: string | null = null;

  chartMetrics: ChartMetric[] = [];

  readonly quickLinks = [
    { label: 'All Orders',  route: '/admin/orders',     icon: '📦' },
    { label: 'Reviews',     route: '/admin/reviews',    icon: '⭐' },
    { label: 'Categories',  route: '/admin/categories', icon: '🗂️' },
    { label: 'Sellers',     route: '/admin/sellers',    icon: '🏪' },
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.buildChartMetrics(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = (err?.error?.message as string | undefined) ?? 'Failed to load dashboard data.';
        this.loading = false;
      }
    });
  }

  private buildChartMetrics(d: AdminDashboard): void {
    const orders   = d.totalOrders   ?? 0;
    const users    = d.totalUsers    ?? 0;
    const products = d.totalProducts ?? 0;
    const max = Math.max(orders, users, products, 1);

    this.chartMetrics = [
      { label: 'Total Orders',   value: orders,   pct: Math.round((orders   / max) * 100), colorVar: '#2563eb' },
      { label: 'Registered Users', value: users,  pct: Math.round((users    / max) * 100), colorVar: '#0891b2' },
      { label: 'Active Products', value: products, pct: Math.round((products / max) * 100), colorVar: '#7c3aed' },
    ];
  }
}

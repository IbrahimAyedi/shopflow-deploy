export interface AdminDashboard {
  totalRevenue?: number;
  totalOrders?: number;
  totalUsers?: number;
  totalProducts?: number;
  recentOrders?: any[];
}

export interface SellerDashboard {
  sellerRevenue?: number;
  pendingOrders?: number;
  lowStockProducts?: any[];
  recentOrders?: any[];
  totalProducts?: number;
}

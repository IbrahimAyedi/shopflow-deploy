import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { AddressesComponent } from './pages/addresses/addresses.component';
import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { CartComponent } from './pages/cart/cart.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { ProductsComponent } from './pages/products/products.component';
import { RegisterComponent } from './pages/register/register.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { SellerProductsComponent } from './pages/seller-products/seller-products.component';
import { SellerProfileComponent } from './pages/seller-profile/seller-profile.component';
import { SellerOrdersComponent } from './pages/seller-orders/seller-orders.component';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
import { AdminReviewsComponent } from './pages/admin-reviews/admin-reviews.component';
import { AdminSellersComponent } from './pages/admin-sellers/admin-sellers.component';
import { AdminCouponsComponent } from './pages/admin-coupons/admin-coupons.component';
import { AdminSellerRequestsComponent } from './pages/admin-seller-requests/admin-seller-requests.component';

import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'products/:id', component: ProductDetailsComponent, canActivate: [AuthGuard] },
  { path: 'addresses', component: AddressesComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['CUSTOMER'] } },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['CUSTOMER'] } },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['CUSTOMER'] } },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/categories', component: AdminCategoriesComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/coupons', component: AdminCouponsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/sellers', component: AdminSellersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/seller-requests', component: AdminSellerRequestsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/reviews', component: AdminReviewsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'seller/dashboard', component: SellerDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SELLER'] } },
  { path: 'seller/profile', component: SellerProfileComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SELLER'] } },
  { path: 'seller/products', component: SellerProductsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SELLER'] } },
  { path: 'seller/orders', component: SellerOrdersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['SELLER'] } },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

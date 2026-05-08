import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProductsComponent } from './pages/products/products.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { AddressesComponent } from './pages/addresses/addresses.component';
import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { SellerProductsComponent } from './pages/seller-products/seller-products.component';
import { SellerProfileComponent } from './pages/seller-profile/seller-profile.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { SellerOrdersComponent } from './pages/seller-orders/seller-orders.component';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
import { AdminReviewsComponent } from './pages/admin-reviews/admin-reviews.component';
import { AdminSellersComponent } from './pages/admin-sellers/admin-sellers.component';
import { AdminCouponsComponent } from './pages/admin-coupons/admin-coupons.component';
import { AdminSellerRequestsComponent } from './pages/admin-seller-requests/admin-seller-requests.component';
import { FormatCurrencyPipe } from './core/pipes/format-currency.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProductsComponent,
    CartComponent,
    OrdersComponent,
    AddressesComponent,
    AdminCategoriesComponent,
    AdminDashboardComponent,
    HomeComponent,
    ProductDetailsComponent,
    SellerDashboardComponent,
    SellerProductsComponent,
    SellerProfileComponent,
    ProfileComponent,
    SellerOrdersComponent,
    AdminOrdersComponent,
    AdminReviewsComponent,
    AdminSellersComponent,
    AdminCouponsComponent,
    AdminSellerRequestsComponent,
    FormatCurrencyPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

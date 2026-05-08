// CartService houwa service responsable 3la panier mta3 customer

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import {
  ApplyCouponRequest,
  Cart,
  CartItemRequest,
  UpdateCartItemQuantityRequest
} from '../../models/cart.models';

@Injectable({
  providedIn: 'root'
})
// component ma ykallamch backend direct, yesta3mel CartService

export class CartService {

  constructor(private http: HttpClient) { }
  // tjib panier mta3 customer connecté

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${API_BASE_URL}/api/cart`);
  }
  // tzid produit lel panier

  addItem(request: CartItemRequest): Observable<Cart> {
    return this.http.post<Cart>(`${API_BASE_URL}/api/cart/items`, request);
  }
  // tbaddel quantité mta3 item موجود fi panier

  updateItemQuantity(itemId: number, quantite: number): Observable<Cart> {
    const request: UpdateCartItemQuantityRequest = { quantite };
    return this.http.put<Cart>(`${API_BASE_URL}/api/cart/items/${itemId}`, request);
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${API_BASE_URL}/api/cart/items/${itemId}`);
  }
  // tappliqui coupon code 3al panier

  applyCoupon(code: string): Observable<Cart> {
    const request: ApplyCouponRequest = { code };
    return this.http.post<Cart>(`${API_BASE_URL}/api/cart/coupon`, request);
  }

  removeCoupon(): Observable<Cart> {
    return this.http.delete<Cart>(`${API_BASE_URL}/api/cart/coupon`);
  }
}

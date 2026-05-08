// OrderService houwa service responsable 3la commandes/orders
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { Order, PageResponse, PaymentMethod, PlaceOrderRequest } from '../../models/order.models';

@Injectable({
  providedIn: 'root'
})
// component ma ykallamch backend direct, yesta3mel OrderService

export class OrderService {

  constructor(private http: HttpClient) { }
  // tconfirmi panier w tcreate order jdida b address mta3 livraison

  placeOrder(addressId: number): Observable<Order> {
    const request: PlaceOrderRequest = { addressId };
    return this.http.post<Order>(`${API_BASE_URL}/api/orders`, request);
  }
  // tjib commandes mta3 customer connecté b pagination

  getMyOrders(page = 0, size = 10): Observable<PageResponse<Order>> {
    return this.http.get<PageResponse<Order>>(
      `${API_BASE_URL}/api/orders/my?page=${page}&size=${size}&sort=dateCommande,desc`
    );
  }
  // tjib details mta3 order wa7da حسب id

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/api/orders/${id}`);
  }
  // customer ynajem ycancel order ken status mte3ha يسمح

  cancelOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${API_BASE_URL}/api/orders/${id}/cancel`, {});
  }
  // tjib commandes mta3 seller connecté

  getSellerOrders(page = 0, size = 10): Observable<PageResponse<Order>> {
    return this.http.get<PageResponse<Order>>(
      `${API_BASE_URL}/api/orders/seller?page=${page}&size=${size}&sort=dateCommande,desc`
    );
  }

  getAllOrders(page = 0, size = 10): Observable<PageResponse<Order>> {
    return this.http.get<PageResponse<Order>>(
      `${API_BASE_URL}/api/orders?page=${page}&size=${size}&sort=dateCommande,desc`
    );
  }
  // admin ybaddel status mta3 order

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${API_BASE_URL}/api/orders/${id}/status`, { status });
  }

  acceptOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${API_BASE_URL}/api/orders/${id}/accept`, {});
  }

  rejectOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${API_BASE_URL}/api/orders/${id}/reject`, {});
  }

  selectPaymentMethod(id: number, paymentMethod: PaymentMethod): Observable<Order> {
    return this.http.put<Order>(`${API_BASE_URL}/api/orders/${id}/payment-method`, { paymentMethod });
  }
}

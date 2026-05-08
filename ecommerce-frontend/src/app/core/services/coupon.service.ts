import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { CouponRequest, CouponResponse, CouponValidationResponse } from '../../models/coupon.models';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  constructor(private http: HttpClient) { }

  getCoupons(): Observable<CouponResponse[]> {
    return this.http.get<CouponResponse[]>(`${API_BASE_URL}/api/coupons`);
  }

  createCoupon(request: CouponRequest): Observable<CouponResponse> {
    return this.http.post<CouponResponse>(`${API_BASE_URL}/api/coupons`, request);
  }

  updateCoupon(id: number, request: CouponRequest): Observable<CouponResponse> {
    return this.http.put<CouponResponse>(`${API_BASE_URL}/api/coupons/${id}`, request);
  }

  deleteCoupon(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/coupons/${id}`);
  }

  validateCoupon(code: string): Observable<CouponValidationResponse> {
    return this.http.get<CouponValidationResponse>(`${API_BASE_URL}/api/coupons/validate/${code}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { SellerProfile, SellerProfileRequest } from '../../models/seller.models';

@Injectable({
  providedIn: 'root'
})
export class SellerService {

  constructor(private http: HttpClient) { }

  getProfile(): Observable<SellerProfile> {
    return this.http.get<SellerProfile>(`${API_BASE_URL}/api/seller/profile`);
  }

  updateProfile(request: SellerProfileRequest): Observable<SellerProfile> {
    return this.http.put<SellerProfile>(`${API_BASE_URL}/api/seller/profile`, request);
  }
}

// SellerRequestService houwa service responsable 3la demandes mta3 création compte vendeur

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import {
  SellerAccountRequest,
  SellerAccountRequestCreateRequest,
  SellerAccountRequestDecisionRequest
} from '../../models/seller-request.models';

@Injectable({
  providedIn: 'root'
})
export class SellerRequestService {

  constructor(private http: HttpClient) { }
  // visitor/customer yab3ath demande bech ywalli seller

  createRequest(payload: SellerAccountRequestCreateRequest): Observable<SellerAccountRequest> {
    return this.http.post<SellerAccountRequest>(`${API_BASE_URL}/api/seller-requests`, payload);
  }
  // admin yjib toutes les demandes: pending, approved, rejected

  getRequests(): Observable<SellerAccountRequest[]> {
    return this.http.get<SellerAccountRequest[]>(`${API_BASE_URL}/api/admin/seller-requests`);
  }

  getPendingRequests(): Observable<SellerAccountRequest[]> {
    return this.http.get<SellerAccountRequest[]>(`${API_BASE_URL}/api/admin/seller-requests/pending`);
  }

  approveRequest(id: number): Observable<SellerAccountRequest> {
    return this.http.patch<SellerAccountRequest>(`${API_BASE_URL}/api/admin/seller-requests/${id}/approve`, {});
  }

  rejectRequest(id: number, reviewNote?: string | null): Observable<SellerAccountRequest> {
    const payload: SellerAccountRequestDecisionRequest = {
      reviewNote: reviewNote?.trim() || null
    };
    return this.http.patch<SellerAccountRequest>(`${API_BASE_URL}/api/admin/seller-requests/${id}/reject`, payload);
  }
}

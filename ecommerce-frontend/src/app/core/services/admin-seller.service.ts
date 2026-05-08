import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { AdminSellerRequest, AdminSellerResponse } from '../../models/admin-seller.models';
//provieded in root bech n5ali service wa7ed w ykoun accessible
@Injectable({
  providedIn: 'root'
})
// he4a wasta bin angular w spring boot kol may5es seller
export class AdminSellerService {

  constructor(private http: HttpClient) { }
  //bech tjib les sellers mta3 l'admin
  getSellers(): Observable<AdminSellerResponse[]> {
    return this.http.get<AdminSellerResponse[]>(`${API_BASE_URL}/api/admin/sellers`);
  }
  //bech tzid seller jdida
  createSeller(request: AdminSellerRequest): Observable<AdminSellerResponse> {
    return this.http.post<AdminSellerResponse>(`${API_BASE_URL}/api/admin/sellers`, request);
  }
  //bech t3ayet l'api bech t3awed tzid seller jdida
  uploadLogo(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${API_BASE_URL}/api/admin/sellers/upload-logo`, formData);
  }

  /**
   * Toggle seller active state. Backend expected: PATCH /api/admin/sellers/{id}/active with body { active: boolean }
   */
  setSellerActive(id: number, active: boolean): Observable<void> {
    return this.http.patch<void>(`${API_BASE_URL}/api/admin/sellers/${id}/active`, { active });
  }
}

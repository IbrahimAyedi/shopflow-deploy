// DashboardService houwa service responsable 3la data mta3 dashboards

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { AdminDashboard, SellerDashboard } from '../../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}
  // tjib statistiques générales mta3 admin dashboard

  getAdminDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${API_BASE_URL}/api/dashboard/admin`);
  }
  // backend ya3raf seller grâce lel JWT token

  getSellerDashboard(): Observable<SellerDashboard> {
    return this.http.get<SellerDashboard>(`${API_BASE_URL}/api/dashboard/seller`);
  }
}

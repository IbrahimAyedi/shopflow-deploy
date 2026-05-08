// kol yest3mel el auth service, yest3mel el methods elly feha bech yed5ol, 
// yregister, y3raf el user elly 3amel login, w y5roj
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { AuthRequest, AuthResponse, CurrentUserResponse, Role } from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
// ta3raf service responsable 3la logic authentication
export class AuthService {
  // storageKey esm el clé elli n5aznou ta7tha auth data fi localStorage
  private readonly storageKey = 'shopflow_auth';

  constructor(private http: HttpClient) { }
  // teb3ath email/password lel backend bech user ya3mel login
  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, request);
  }
  // teb3ath données mta3 register lel backend bech ya3mel compte customer jdid
  // fel projet mte3na seller ma ya3melch register direct, ya3mel seller request
  register(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/api/auth/register`, request);
  }
  // tjib informations mta3 user connecté men backend
  // backend ya3raf user grâce lel token elli yetb3ath m3a request
  me(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(`${API_BASE_URL}/api/auth/me`);
  }
  // ba3ad login bech na3mel save ll auth response fi local storage
  saveAuth(auth: AuthResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(auth));
  }
    // traja3 token JWT ken mawjoud
  getToken(): string | null {
    return this.getAuth()?.token ?? null;
  }
    // ta9ra auth data men localStorage w traja3ha k object

  getAuth(): AuthResponse | null {
    const storedAuth = localStorage.getItem(this.storageKey);

    if (!storedAuth) {
      return null;
    }

    try {
      return JSON.parse(storedAuth) as AuthResponse;
    } catch {
      this.logout();
      return null;
    }
  }

  isLoggedIn(): boolean {
    return Boolean(this.getToken());
  }

  getRole(): Role | null {
    return this.getAuth()?.role ?? null;
  }

  hasRole(role: Role): boolean {
    return this.getRole() === role;
  }
// tchouf ken role mta3 user mawjouda fi liste mta3 roles atuiruse
  hasAnyRole(roles: Role[]): boolean {
    const userRole = this.getRole();
    return userRole ? roles.includes(userRole) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isSeller(): boolean {
    return this.hasRole('SELLER');
  }

  isCustomer(): boolean {
    return this.hasRole('CUSTOMER');
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }
}

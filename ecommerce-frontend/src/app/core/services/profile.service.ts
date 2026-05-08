import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { UserProfile, UpdateUserProfileRequest } from '../../models/profile.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API_BASE_URL}/api/profile`);
  }

  updateProfile(request: UpdateUserProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${API_BASE_URL}/api/profile`, request);
  }

  deactivateAccount(): Observable<void> {
    return this.http.patch<void>(`${API_BASE_URL}/api/profile/deactivate`, {});
  }
}

// ReviewService houwa service responsable 3la reviews/avis mta3 products

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { ReviewRequest, ReviewResponse } from '../../models/review.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(private http: HttpClient) { }

  addReview(request: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${API_BASE_URL}/api/reviews`, request);
  }
  // tjib reviews mta3 product معين

  getProductReviews(productId: number): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${API_BASE_URL}/api/reviews/product/${productId}`);
  }
  // admin yjib reviews elli mazelt pending

  getPendingReviews(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${API_BASE_URL}/api/reviews/pending`);
  }

  approveReview(id: number): Observable<ReviewResponse> {
    return this.http.put<ReviewResponse>(`${API_BASE_URL}/api/reviews/${id}/approve`, {});
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/reviews/${id}`);
  }
}

// ProductService houwa service responsable 3la produits

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { Product, ProductRequest } from '../../models/product.models';

/** Resolves a product imageUrl to a fully-qualified URL.
 *  Relative /uploads/ paths are prefixed with the backend origin. */
export function resolveImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('/uploads/')) return `${API_BASE_URL}${imageUrl}`;
  return imageUrl;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_BASE_URL}/api/products`);
  }

  getSellerProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_BASE_URL}/api/products/seller`);
  }
  // nesta3mlouha fi product-details page

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_BASE_URL}/api/products/${id}`);
  }

  createProduct(request: ProductRequest): Observable<Product> {
    return this.http.post<Product>(`${API_BASE_URL}/api/products`, request);
  }

  updateProduct(id: number, request: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${API_BASE_URL}/api/products/${id}`, request);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/products/${id}`);
  }

  uploadProductImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${API_BASE_URL}/api/products/upload-image`, formData);
  }
}

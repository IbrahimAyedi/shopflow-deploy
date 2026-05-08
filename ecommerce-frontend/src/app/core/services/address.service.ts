// he4a wasta bin angular w spring boot kol may5es adresse

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { Address, AddressRequest } from '../../models/address.models';
//provieded in root bech n5ali service wa7ed w ykoun accessible men ay component w ma n7ebch n3awdouha f kol component
@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(private http: HttpClient) { }
  //bech tjib les adresses mta3 l'utilisateur connecté
  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${API_BASE_URL}/api/addresses`);
  }
//bech tzid adresse jdida
  addAddress(request: AddressRequest): Observable<Address> {
    return this.http.post<Address>(`${API_BASE_URL}/api/addresses`, request);
  }
// bech tkoun adresse principal
  setPrincipal(id: number): Observable<Address> {
    return this.http.put<Address>(`${API_BASE_URL}/api/addresses/${id}/principal`, {});
  }
  // bech tfse5 adresse 
  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/addresses/${id}`);
  }
}

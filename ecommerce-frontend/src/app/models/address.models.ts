// Data sent from Angular to the backend when the customer creates an address.

export interface AddressRequest {
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}
// Address object returned by the backend.

export interface Address {
  id: number;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}

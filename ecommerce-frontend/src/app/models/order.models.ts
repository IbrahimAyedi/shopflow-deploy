export interface PlaceOrderRequest {
  addressId: number;
}

export interface OrderItem {
  id?: number;
  productId?: number;
  productName?: string;
  productNom?: string;
  quantite?: number;
  quantity?: number;
  prixUnitaire?: number;
  unitPrice?: number;
  total?: number;
  sousTotal?: number;
}

export type PaymentMethod = 'ESPECE' | 'CARTE' | 'CHEQUE';

export interface Order {
  id: number;
  numeroCommande?: string;
  orderNumber?: string;
  statut?: string;
  status?: string;
  customerEmail?: string;
  dateCommande?: string;
  createdAt?: string;
  addressId?: number;
  sousTotal?: number;
  remise?: number;
  fraisLivraison?: number;
  totalTTC?: number;
  total?: number;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  paymentMethod?: PaymentMethod | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface SelectPaymentMethodRequest {
  paymentMethod: PaymentMethod;
}

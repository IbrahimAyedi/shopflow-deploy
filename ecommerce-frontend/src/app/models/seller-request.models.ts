export type SellerRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SellerAccountRequestCreateRequest {
  fullName: string;
  email: string;
  phone: string;
  shopName: string;
  shopDescription?: string | null;
  address?: string | null;
  message?: string | null;
}

export interface SellerAccountRequestDecisionRequest {
  reviewNote?: string | null;
}

export interface SellerAccountRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  shopName: string;
  shopDescription?: string | null;
  address?: string | null;
  message?: string | null;
  status: SellerRequestStatus;
  createdAt?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  sellerEmail?: string | null;
  temporaryPassword?: string | null;
}

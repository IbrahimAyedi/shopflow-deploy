import { Role } from './auth.models';

export interface AdminSellerRequest {
  email: string;
  password: string;
  fullName?: string | null;
  phone?: string | null;
  shopName: string;
  description?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  active?: boolean | null;
}

export interface AdminSellerResponse {
  userId: number;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  role: Role;
  active: boolean;
  sellerProfileId?: number | null;
  shopName?: string | null;
  description?: string | null;
  address?: string | null;
  logoUrl?: string | null;
}
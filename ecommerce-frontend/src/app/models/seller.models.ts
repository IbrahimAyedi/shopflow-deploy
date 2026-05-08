export interface SellerProfile {
  id?: number;
  nomBoutique?: string | null;
  description?: string | null;
  logo?: string | null;
  note?: number | null;
  userId?: number;
}

export interface SellerProfileRequest {
  nomBoutique: string;
  description?: string | null;
  logo?: string | null;
}

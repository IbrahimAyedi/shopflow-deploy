export type CouponType = 'PERCENT' | 'FIXED';

export interface CouponRequest {
  code: string;
  type: CouponType;
  valeur: number;
  dateExpiration?: string | null;
  usagesMax?: number | null;
  actif?: boolean | null;
}

export interface CouponResponse {
  id: number;
  code: string;
  type: CouponType;
  valeur: number;
  dateExpiration?: string | null;
  usagesMax?: number | null;
  usagesActuels?: number | null;
  actif: boolean;
}

export interface CouponValidationResponse {
  code: string;
  valid: boolean;
  message: string;
  coupon?: CouponResponse | null;
}

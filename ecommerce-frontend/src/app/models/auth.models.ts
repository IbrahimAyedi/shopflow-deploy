export type Role = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  role: Role;
}

export interface CurrentUserResponse {
  userId: number;
  email: string;
  role: Role;
  active: boolean;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  errorCode: string;
  message: string;
  path: string;
  details?: Record<string, string>;
}

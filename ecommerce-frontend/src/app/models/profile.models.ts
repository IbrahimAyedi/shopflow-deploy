export interface UserProfile {
  id: number;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
  active: boolean;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateUserProfileRequest {
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

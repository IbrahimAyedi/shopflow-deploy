export interface ReviewRequest {
  productId: number;
  note: number;
  commentaire?: string;
}

export interface ReviewResponse {
  id: number;
  userId: number;
  customerEmail?: string;
  customerName?: string;
  productId: number;
  note: number;
  commentaire?: string;
  approuve: boolean;
  dateCreation: string;
}

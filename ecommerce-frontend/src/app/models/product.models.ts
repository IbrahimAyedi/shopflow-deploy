export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  prixPromo?: number | null;
  actif?: boolean;
  note?: number | null;
  dateCreation?: string;
  imageUrl?: string | null;
  sellerId?: number | null;
  sellerName?: string | null;
  sellerShopName?: string | null;
  sellerLogoUrl?: string | null;
  categoryIds?: number[] | null;
  categoryNames?: string[] | null;
}

export interface ProductRequest {
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  categoryIds?: number[] | null;
}

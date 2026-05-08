export interface CartItemRequest {
  productId: number;
  variantId?: number | null;
  quantite: number;
}

export interface UpdateCartItemQuantityRequest {
  quantite: number;
}

export interface ApplyCouponRequest {
  code: string;
}

export interface CartItem {
  id: number;
  productId?: number;
  productName?: string;
  nomProduit?: string;
  productNom?: string;
  variantId?: number | null;
  quantite?: number;
  quantity?: number;
  prixUnitaire?: number;
  unitPrice?: number;
  sousTotal?: number;
  total?: number;
  totalPrice?: number;
}

export interface Cart {
  id: number;
  items?: CartItem[];
  lignes?: CartItem[];
  cartItems?: CartItem[];
  sousTotal?: number;
  remise?: number;
  fraisLivraison?: number;
  totalTTC?: number;
  couponCode?: string | null;
}

export interface Category {
  id: number;
  nom: string;
  description?: string | null;
  parentId?: number | null;
  children?: Category[] | null;
}

export interface CategoryRequest {
  nom: string;
  description?: string | null;
  parentId?: number | null;
}

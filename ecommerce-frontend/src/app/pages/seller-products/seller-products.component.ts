import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CategoryService } from '../../core/services/category.service';
import { ProductService, resolveImageUrl } from '../../core/services/product.service';
import { Category } from '../../models/category.models';
import { Product, ProductRequest } from '../../models/product.models';

interface ProductFormModel {
  name: string;
  price: number | null;
  quantity: number | null;
  imageUrl: string;
  categoryId: number | null;
}

@Component({
  selector: 'app-seller-products',
  templateUrl: './seller-products.component.html',
  styleUrls: ['./seller-products.component.css']
})
export class SellerProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  createModel: ProductFormModel = this.createEmptyProduct();
  editModel: ProductFormModel = this.createEmptyProduct();
  
  showCreateModal = false;
  editingProductId: number | null = null;
  editingProductName = '';
  productPendingDelete: Product | null = null;

  loading = false;
  submitting = false;
  deletingProductId: number | null = null;
  
  errorMessage = '';
  actionMessage = '';
  actionErrorMessage = '';
  modalErrorMessage = '';

  // Image upload state
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  resolveImageUrl = resolveImageUrl;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.categoryService.getCategories().subscribe({
      next: cats => { this.categories = cats; },
      error: () => { /* categories optional — fail silently */ }
    });
  }

  get hasProducts(): boolean {
    return this.products.length > 0;
  }

  get isEditing(): boolean {
    return this.editingProductId !== null;
  }

  // Loads only the products that belong to the currently logged-in seller.
  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getSellerProducts().subscribe({
      next: products => {
        this.products = products;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load products');
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.createModel = this.createEmptyProduct();
    this.clearImage();
    this.showCreateModal = true;
  }

  closeCreateModal(form?: NgForm): void {
    if (this.submitting) return;
    this.showCreateModal = false;
    this.modalErrorMessage = '';
    this.createModel = this.createEmptyProduct();
    this.clearImage();
    form?.resetForm(this.createModel);
  }

  // Validates the create form; if an image was selected, uploads it first then creates the product.
  submitCreateModal(form: NgForm): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';

    if (form.invalid || this.createModel.price === null || this.createModel.quantity === null) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.modalErrorMessage = 'Name, price, and quantity are required.';
      return;
    }

    this.submitting = true;

    if (this.selectedFile) {
      this.productService.uploadProductImage(this.selectedFile).subscribe({
        next: result => {
          this.createModel.imageUrl = result.imageUrl;
          this.selectedFile = null;
          this.executeCreate(form);
        },
        error: error => {
          this.modalErrorMessage = this.getErrorMessage(error, 'Failed to upload image');
          this.submitting = false;
        }
      });
    } else {
      this.executeCreate(form);
    }
  }

  // Calls the product creation API and refreshes the product list on success.
  private executeCreate(form: NgForm): void {
    const request = this.prepareRequest(this.createModel);
    
    this.productService.createProduct(request).subscribe({
      next: () => {
        this.actionMessage = 'Product created.';
        this.submitting = false;
        this.closeCreateModal(form);
        this.loadProducts();
      },
      error: error => {
        this.modalErrorMessage = this.getErrorMessage(error, 'Failed to create product');
        this.submitting = false;
      }
    });
  }

  // Opens the edit form pre-populated with the selected product's current data.
  editProduct(product: Product): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.editingProductId = product.id;
    this.editingProductName = product.name;
    this.editModel = {
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      imageUrl: product.imageUrl ?? '',
      categoryId: product.categoryIds?.[0] ?? null
    };
    this.clearImage();
    this.imagePreview = product.imageUrl ? this.resolveImageUrl(product.imageUrl) : null;
  }

  // Validates the edit form; uploads a new image if selected, then saves product changes.
  saveEdit(form: NgForm): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';

    if (form.invalid || this.editModel.price === null || this.editModel.quantity === null) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.modalErrorMessage = 'Name, price, and quantity are required.';
      return;
    }

    if (this.editingProductId === null) return;

    this.submitting = true;

    if (this.selectedFile) {
      this.productService.uploadProductImage(this.selectedFile).subscribe({
        next: result => {
          this.editModel.imageUrl = result.imageUrl;
          this.selectedFile = null;
          this.executeUpdate(form);
        },
        error: error => {
          this.modalErrorMessage = this.getErrorMessage(error, 'Failed to upload image');
          this.submitting = false;
        }
      });
    } else {
      this.executeUpdate(form);
    }
  }

  private executeUpdate(form: NgForm): void {
    if (this.editingProductId === null) return;
    
    const request = this.prepareRequest(this.editModel);
    this.productService.updateProduct(this.editingProductId, request).subscribe({
      next: () => {
        this.actionMessage = 'Product updated.';
        this.submitting = false;
        this.closeEditModal(form);
        this.loadProducts();
      },
      error: error => {
        this.modalErrorMessage = this.getErrorMessage(error, 'Failed to update product');
        this.submitting = false;
      }
    });
  }

  cancelEdit(form: NgForm): void {
    if (this.submitting) return;
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.closeEditModal(form);
  }

  private closeEditModal(form: NgForm): void {
    this.editingProductId = null;
    this.editingProductName = '';
    this.editModel = this.createEmptyProduct();
    this.clearImage();
    this.modalErrorMessage = '';
    form.resetForm(this.editModel);
  }

  requestDeleteProduct(product: Product): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.productPendingDelete = product;
  }

  cancelDeleteProduct(): void {
    if (this.deletingProductId === null) {
      this.productPendingDelete = null;
    }
  }

  // Executes the product deletion after the user confirmed the delete prompt.
  confirmDeleteProduct(): void {
    if (!this.productPendingDelete) return;

    const product = this.productPendingDelete;
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.deletingProductId = product.id;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products = this.products.filter(item => item.id !== product.id);
        this.actionMessage = 'Product removed from your catalogue.';
        this.deletingProductId = null;
        this.productPendingDelete = null;
      },
      error: error => {
        if (error instanceof HttpErrorResponse && error.status === 403) {
          this.actionErrorMessage = 'You can only delete products assigned to your seller account.';
        } else {
          this.actionErrorMessage = 'This product could not be removed. Please try again.';
        }
        this.deletingProductId = null;
        this.productPendingDelete = null;
      }
    });
  }

  // Validates the selected image file (type and size) and shows a local preview.
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.modalErrorMessage = 'Only JPG, PNG, and WebP images are allowed.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.modalErrorMessage = 'File exceeds 5 MB limit.';
      return;
    }

    this.selectedFile = file;
    this.modalErrorMessage = '';

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  private createEmptyProduct(): ProductFormModel {
    return { name: '', price: null, quantity: null, imageUrl: '', categoryId: null };
  }

  private prepareRequest(model: ProductFormModel): ProductRequest {
    return {
      name: model.name.trim(),
      price: Number(model.price),
      quantity: Number(model.quantity),
      imageUrl: model.imageUrl.trim() || null,
      categoryIds: model.categoryId != null ? [model.categoryId] : null
    };
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as { message?: string; details?: Record<string, string> } | null;
      if (apiError?.message) return this.formatApiError(apiError.message, apiError.details);
    }
    return fallbackMessage;
  }

  private formatApiError(message: string, details?: Record<string, string>): string {
    if (!details) return message;
    const detailMessages = Object.values(details);
    return detailMessages.length > 0 ? `${message}: ${detailMessages.join(', ')}` : message;
  }
}

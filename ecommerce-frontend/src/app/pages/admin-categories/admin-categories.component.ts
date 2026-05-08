import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryRequest } from '../../models/category.models';

interface CategoryLike {
  id: number;
  nom?: string | null;
  description?: string | null;
  parentId?: number | null;
  name?: string | null;
  parent?: { id?: number | null } | null;
  parentCategoryId?: number | null;
  children?: CategoryLike[] | null;
}

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  createModel: CategoryRequest = this.createEmptyCategory();
  editModel: CategoryRequest = this.createEmptyCategory();
  showCreateModal = false;
  editingCategoryId: number | null = null;
  editingCategoryName = '';
  categoryPendingDelete: Category | null = null;
  loading = false;
  submitting = false;
  deletingCategoryId: number | null = null;
  errorMessage = '';
  actionMessage = '';
  actionErrorMessage = '';
  modalErrorMessage = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  get hasCategories(): boolean {
    return this.categories.length > 0;
  }

  get isEditing(): boolean {
    return this.editingCategoryId !== null;
  }

  get parentOptions(): Category[] {
    return this.categories.filter(category => category.id !== this.editingCategoryId);
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.categoryService.getCategories().subscribe({
      next: categories => {
        this.categories = categories.map(category => this.normalizeCategory(category));
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load categories');
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.createModel = this.createEmptyCategory();
    this.showCreateModal = true;
  }

  closeCreateModal(form?: NgForm): void {
    if (this.submitting) {
      return;
    }

    this.showCreateModal = false;
    this.modalErrorMessage = '';
    this.resetCreateForm(form);
  }

  submitCreateModal(form: NgForm): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.modalErrorMessage = 'Category name is required.';
      return;
    }

    const request = this.prepareRequest(this.createModel);
    this.submitting = true;

    this.categoryService.createCategory(request).subscribe({
      next: () => {
        this.actionMessage = 'Category created.';
        this.submitting = false;
        this.showCreateModal = false;
        this.resetCreateForm(form);
        this.loadCategories();
      },
      error: error => {
        this.modalErrorMessage = this.getErrorMessage(error, 'Failed to create category');
        this.submitting = false;
      }
    });
  }

  editCategory(category: Category): void {
    const selectedCategory = this.normalizeCategory(category);
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.editingCategoryId = selectedCategory.id;
    this.editingCategoryName = selectedCategory.nom;
    this.editModel = {
      nom: selectedCategory.nom,
      description: selectedCategory.description ?? '',
      parentId: selectedCategory.parentId ?? null
    };
  }

  saveEdit(form: NgForm): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.modalErrorMessage = 'Category name is required.';
      return;
    }

    if (this.editingCategoryId === null) {
      return;
    }

    const categoryId = this.editingCategoryId;
    const request = this.prepareRequest(this.editModel);
    this.submitting = true;

    this.categoryService.updateCategory(categoryId, request).subscribe({
      next: () => {
        this.actionMessage = 'Category updated.';
        this.submitting = false;
        this.closeEditModal(form);
        this.loadCategories();
      },
      error: error => {
        this.modalErrorMessage = this.getErrorMessage(error, 'Failed to update category');
        this.submitting = false;
      }
    });
  }

  cancelEdit(form: NgForm): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.closeEditModal(form);
  }

  requestDeleteCategory(category: Category): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.categoryPendingDelete = category;
  }

  cancelDeleteCategory(): void {
    if (this.deletingCategoryId === null) {
      this.categoryPendingDelete = null;
    }
  }

  confirmDeleteCategory(): void {
    if (!this.categoryPendingDelete) {
      return;
    }

    const category = this.categoryPendingDelete;
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.deletingCategoryId = category.id;

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(item => item.id !== category.id);
        if (this.editingCategoryId === category.id) {
          this.editModel = this.createEmptyCategory();
          this.editingCategoryId = null;
          this.editingCategoryName = '';
        }
        this.actionMessage = 'Category deleted.';
        this.deletingCategoryId = null;
        this.categoryPendingDelete = null;
      },
      error: error => {
        this.actionErrorMessage = this.getDeleteErrorMessage(error);
        this.deletingCategoryId = null;
        this.categoryPendingDelete = null;
      }
    });
  }

  getParentName(parentId?: number | null): string {
    if (parentId === null || parentId === undefined) {
      return 'Root category';
    }

    return this.categories.find(category => category.id === parentId)?.nom ?? `Category #${parentId}`;
  }

  private createEmptyCategory(): CategoryRequest {
    return {
      nom: '',
      description: '',
      parentId: null
    };
  }

  private normalizeCategory(category: CategoryLike): Category {
    return {
      id: category.id,
      nom: category.nom ?? category.name ?? '',
      description: category.description ?? '',
      parentId: category.parentId ?? category.parentCategoryId ?? category.parent?.id ?? null,
      children: category.children?.map(child => this.normalizeCategory(child)) ?? null
    };
  }

  private prepareRequest(model: CategoryRequest): CategoryRequest {
    return {
      nom: model.nom.trim(),
      description: model.description?.trim() || null,
      parentId: model.parentId ?? null
    };
  }

  private resetCreateForm(form?: NgForm): void {
    this.createModel = this.createEmptyCategory();
    form?.resetForm(this.createModel);
  }

  private closeEditModal(form: NgForm): void {
    this.editingCategoryId = null;
    this.editingCategoryName = '';
    this.editModel = this.createEmptyCategory();
    this.modalErrorMessage = '';
    form.resetForm(this.editModel);
  }

  private getDeleteErrorMessage(error: unknown): string {
    const message = this.getErrorMessage(error, 'Failed to delete category');

    if (this.isLinkedProductsDeleteError(message)) {
      return 'This category cannot be deleted because products are linked to it. Move or delete the linked products first.';
    }

    return message;
  }

  private isLinkedProductsDeleteError(message: string): boolean {
    const normalizedMessage = message.toLowerCase();
    return normalizedMessage.includes('cannot delete category')
      && normalizedMessage.includes('products are linked');
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      const apiError = error.error as { message?: string; details?: Record<string, string> } | null;

      if (apiError?.message) {
        return this.formatApiError(apiError.message, apiError.details);
      }
    }

    return fallbackMessage;
  }

  private formatApiError(message: string, details?: Record<string, string>): string {
    if (!details) {
      return message;
    }

    const detailMessages = Object.values(details);
    return detailMessages.length > 0 ? `${message}: ${detailMessages.join(', ')}` : message;
  }
}

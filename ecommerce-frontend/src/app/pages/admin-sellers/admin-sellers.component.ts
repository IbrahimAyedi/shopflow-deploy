import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AdminSellerService } from '../../core/services/admin-seller.service';
import { resolveImageUrl } from '../../core/services/product.service';
import { ApiErrorResponse } from '../../models/auth.models';
import { AdminSellerRequest, AdminSellerResponse } from '../../models/admin-seller.models';

@Component({
  selector: 'app-admin-sellers',
  templateUrl: './admin-sellers.component.html',
  styleUrls: ['./admin-sellers.component.css']
})
export class AdminSellersComponent implements OnInit {
  sellers: AdminSellerResponse[] = [];
  loading = false;
  submitting = false;
  errorMessage = '';
  actionMessage = '';
  actionErrorMessage = '';
  modalErrorMessage = '';
  showCreateModal = false;
  createModel: AdminSellerRequest = this.createEmptyModel();
  selectedLogoFile: File | null = null;
  logoPreview: string | null = null;
  uploadingLogo = false;
  resolveLogoUrl = resolveImageUrl;

  constructor(private adminSellerService: AdminSellerService) {}

  ngOnInit(): void {
    this.loadSellers();
  }

  get hasSellers(): boolean {
    return this.sellers.length > 0;
  }

  loadSellers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminSellerService.getSellers().subscribe({
      next: sellers => {
        this.sellers = sellers;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load sellers');
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.createModel = this.createEmptyModel();
    this.clearLogoState();
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
      this.modalErrorMessage = 'Please fill all required seller fields.';
      return;
    }

    if (this.uploadingLogo) {
      this.modalErrorMessage = 'Please wait for the logo upload to finish.';
      return;
    }

    this.submitting = true;

    this.adminSellerService.createSeller(this.prepareRequest(this.createModel)).subscribe({
      next: () => {
        this.actionMessage = 'Seller created.';
        this.submitting = false;
        this.closeCreateModal(form);
        this.loadSellers();
      },
      error: error => {
        this.modalErrorMessage = this.getCreateErrorMessage(error);
        this.submitting = false;
      }
    });
  }

  toggleSellerActive(seller: AdminSellerResponse): void {
    const confirmed = window.confirm(`${seller.active ? 'Deactivate' : 'Reactivate'} seller ${seller.email}?`);
    if (!confirmed) return;

    this.actionMessage = '';
    this.actionErrorMessage = '';
    const newActive = !seller.active;
    this.uploadingLogo = false;

    const sellerId = seller.userId;
    this.adminSellerService.setSellerActive(sellerId, newActive).subscribe({
      next: () => {
        this.actionMessage = newActive ? 'Seller reactivated.' : 'Seller deactivated.';
        this.loadSellers();
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to update seller');
      }
    });
  }

  getLogoInitials(name?: string | null): string {
    if (!name) {
      return 'S';
    }

    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  getCreateLogoPreview(): string {
    if (this.logoPreview) {
      return this.logoPreview;
    }

    return this.resolveLogoUrl(this.createModel.logoUrl);
  }

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.modalErrorMessage = 'Only JPG, PNG, and WebP images are allowed.';
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.modalErrorMessage = 'File exceeds 5 MB limit.';
      input.value = '';
      return;
    }

    this.selectedLogoFile = file;
    this.modalErrorMessage = '';

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.uploadLogo(file);
  }

  clearLogoSelection(): void {
    this.clearLogoState();
    this.createModel.logoUrl = '';
  }

  private createEmptyModel(): AdminSellerRequest {
    return {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      shopName: '',
      description: '',
      address: '',
      logoUrl: '',
      active: true
    };
  }

  private resetCreateForm(form?: NgForm): void {
    this.createModel = this.createEmptyModel();
    this.clearLogoState();
    form?.resetForm(this.createModel);
  }

  private prepareRequest(model: AdminSellerRequest): AdminSellerRequest {
    return {
      email: model.email.trim(),
      password: model.password,
      fullName: model.fullName?.trim() || null,
      phone: model.phone?.trim() || null,
      shopName: model.shopName.trim(),
      description: model.description?.trim() || null,
      address: model.address?.trim() || null,
      logoUrl: model.logoUrl?.trim() || null,
      active: model.active ?? true
    };
  }

  private uploadLogo(file: File): void {
    this.uploadingLogo = true;

    this.adminSellerService.uploadLogo(file).subscribe({
      next: result => {
        this.createModel.logoUrl = result.imageUrl;
        this.uploadingLogo = false;
        this.selectedLogoFile = null;
      },
      error: error => {
        this.modalErrorMessage = this.getUploadErrorMessage(error);
        this.uploadingLogo = false;
      }
    });
  }

  private clearLogoState(): void {
    this.selectedLogoFile = null;
    this.logoPreview = null;
    this.uploadingLogo = false;
  }

  private getCreateErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) {
        return 'A user with this email already exists.';
      }

      if (error.status === 400) {
        return 'Please fill all required seller fields.';
      }

      if (error.status >= 500) {
        return 'Could not create seller. Please check the seller details and try again.';
      }

      const apiError = error.error as ApiErrorResponse | null;

      if (apiError?.message) {
        return apiError.message;
      }
    }

    return 'Could not create seller. Please check the seller details and try again.';
  }

  private getUploadErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | null;

      if (apiError?.message) {
        return apiError.message;
      }
    }

    return 'Could not upload logo. Please choose a JPG, PNG, or WebP image up to 5 MB.';
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | null;

      if (apiError?.message) {
        return apiError.message;
      }
    }

    return fallbackMessage;
  }
}

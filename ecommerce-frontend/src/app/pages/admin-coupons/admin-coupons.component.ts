import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CouponService } from '../../core/services/coupon.service';
import { CouponRequest, CouponResponse } from '../../models/coupon.models';

@Component({
  selector: 'app-admin-coupons',
  templateUrl: './admin-coupons.component.html',
  styleUrls: ['./admin-coupons.component.css']
})
export class AdminCouponsComponent implements OnInit {
  coupons: CouponResponse[] = [];
  loading = false;
  submitting = false;
  errorMessage = '';
  actionMessage = '';
  actionErrorMessage = '';
  modalErrorMessage = '';
  showCreateModal = false;
  editingCouponId: number | null = null;
  couponPendingToggle: CouponResponse | null = null;
  createModel: CouponRequest = this.createEmptyModel();
  editModel: CouponRequest = this.createEmptyModel();
  showConfirmModal = false;
  confirmAction: 'deactivate' | 'reactivate' | null = null;
  couponToConfirm: CouponResponse | null = null;

  constructor(private couponService: CouponService) {}

  ngOnInit(): void {
    this.loadCoupons();
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  closeAllModals(): void {
    if (this.submitting) return;
    this.showCreateModal = false;
    this.editingCouponId = null;
    this.showConfirmModal = false;
    this.couponToConfirm = null;
    this.confirmAction = null;
  }

  get hasCoupons(): boolean {
    return this.coupons.length > 0;
  }

  get isEditing(): boolean {
    return this.editingCouponId !== null;
  }

  get activeModel(): CouponRequest {
    return this.isEditing ? this.editModel : this.createModel;
  }

  // Loads all coupons from the backend and displays them in the table.
  loadCoupons(): void {
    this.loading = true;
    this.errorMessage = '';

    this.couponService.getCoupons().subscribe({
      next: coupons => {
        this.coupons = coupons;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load coupons');
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.createModel = this.createEmptyModel();
    this.showCreateModal = true;
  }

  closeCreateModal(form?: NgForm): void {
    if (this.submitting) {
      return;
    }

    this.showCreateModal = false;
    this.editingCouponId = null;
    this.modalErrorMessage = '';
    this.resetCreateForm(form);
  }

  onBackdropClick(event: MouseEvent, backdrop: HTMLElement): void {
    if (this.submitting) return;
    if (event.currentTarget === backdrop) {
      this.closeAllModals();
    }
  }

  // Validates the create form and sends the new coupon to the backend.
  submitCreateModal(form: NgForm): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.modalErrorMessage = 'Please complete the coupon fields.';
      return;
    }

    this.submitting = true;

    this.couponService.createCoupon(this.prepareRequest(this.createModel)).subscribe({
      next: () => {
        this.actionMessage = 'Coupon created.';
        this.submitting = false;
        this.closeCreateModal(form);
        this.loadCoupons();
      },
      error: error => {
        this.modalErrorMessage = this.getCreateErrorMessage(error);
        this.submitting = false;
      }
    });
  }

  // Populates the edit form with the selected coupon's current data.
  editCoupon(coupon: CouponResponse): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';
    this.editingCouponId = coupon.id;
    this.editModel = this.toRequestModel(coupon);
  }

  saveEdit(form: NgForm): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.modalErrorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.modalErrorMessage = 'Please complete the coupon fields.';
      return;
    }

    if (this.editingCouponId === null) {
      return;
    }

    const couponId = this.editingCouponId;
    this.submitting = true;

    this.couponService.updateCoupon(couponId, this.prepareRequest(this.editModel)).subscribe({
      next: () => {
        this.actionMessage = 'Coupon updated.';
        this.submitting = false;
        this.closeEditModal(form);
        this.loadCoupons();
      },
      error: error => {
        this.modalErrorMessage = this.getCreateErrorMessage(error);
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

  closeEditModal(form?: NgForm): void {
    if (this.submitting) return;
    this.editingCouponId = null;
    this.editModel = this.createEmptyModel();
    form?.resetForm(this.editModel);
  }

  // Opens a confirmation modal to activate or deactivate the selected coupon.
  toggleCouponActive(coupon: CouponResponse): void {
    this.couponToConfirm = coupon;
    this.confirmAction = coupon.actif ? 'deactivate' : 'reactivate';
    this.showConfirmModal = true;
  }

  // Executes the activate/deactivate action after admin confirmed in the modal.
  confirmToggleActive(): void {
    if (!this.couponToConfirm || !this.confirmAction) {
      return;
    }

    const coupon = this.couponToConfirm;
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.couponPendingToggle = coupon;
    this.submitting = true;

    const request = this.toRequestModel(coupon);
    request.actif = !coupon.actif;

    this.couponService.updateCoupon(coupon.id, this.prepareRequest(request)).subscribe({
      next: () => {
        this.actionMessage = coupon.actif ? 'Coupon deactivated.' : 'Coupon reactivated.';
        this.submitting = false;
        this.couponPendingToggle = null;
        this.closeAllModals();
        this.loadCoupons();
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to update coupon');
        this.submitting = false;
        this.couponPendingToggle = null;
      }
    });
  }

  cancelConfirm(): void {
    if (this.submitting) return;
    this.showConfirmModal = false;
    this.couponToConfirm = null;
    this.confirmAction = null;
  }

  getTypeLabel(type: string): string {
    return type === 'PERCENT' ? 'Percent' : 'Fixed';
  }

  formatValue(coupon: CouponResponse): string {
    return coupon.type === 'PERCENT' ? `${coupon.valeur}%` : `${coupon.valeur}`;
  }

  formatExpiration(coupon: CouponResponse): string {
    return coupon.dateExpiration ? coupon.dateExpiration.substring(0, 10) : 'No expiry';
  }

  private createEmptyModel(): CouponRequest {
    return {
      code: '',
      type: 'PERCENT',
      valeur: 10,
      dateExpiration: null,
      usagesMax: null,
      actif: true
    };
  }

  private toRequestModel(coupon: CouponResponse): CouponRequest {
    return {
      code: coupon.code,
      type: coupon.type,
      valeur: coupon.valeur,
      dateExpiration: coupon.dateExpiration ? coupon.dateExpiration.substring(0, 10) : null,
      usagesMax: coupon.usagesMax ?? null,
      actif: coupon.actif
    };
  }

  private prepareRequest(model: CouponRequest): CouponRequest {
    const normalizedDateExpiration = this.normalizeDateExpiration(model.dateExpiration);

    return {
      code: model.code.trim().toUpperCase(),
      type: model.type,
      valeur: Number(model.valeur),
      dateExpiration: normalizedDateExpiration,
      usagesMax: model.usagesMax ?? null,
      actif: model.actif ?? true
    };
  }

  private normalizeDateExpiration(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return null;
    }

    return trimmedValue.length === 10 ? `${trimmedValue}T00:00:00` : trimmedValue;
  }

  private resetCreateForm(form?: NgForm): void {
    this.createModel = this.createEmptyModel();
    form?.resetForm(this.createModel);
  }

  private getCreateErrorMessage(error: unknown): string {
    const apiErrorMessage = this.extractApiErrorMessage(error);
    if (apiErrorMessage) {
      return apiErrorMessage;
    }

    if (error instanceof HttpErrorResponse && error.status === 409) {
      return 'A coupon with this code already exists.';
    }

    return 'Failed to save coupon.';
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    const apiErrorMessage = this.extractApiErrorMessage(error);
    if (apiErrorMessage) {
      return apiErrorMessage;
    }

    return fallbackMessage;
  }

  private extractApiErrorMessage(error: unknown): string | null {
    if (!(error instanceof HttpErrorResponse)) {
      return null;
    }

    const body = error.error;
    if (!body) {
      return null;
    }

    if (typeof body === 'string') {
      const trimmedBody = body.trim();
      return trimmedBody || null;
    }

    if (typeof body === 'object') {
      const typedBody = body as {
        message?: unknown;
        detail?: unknown;
        error?: unknown;
      };

      const message = typedBody.message ?? typedBody.detail ?? typedBody.error;
      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }
    }

    return null;
  }
}

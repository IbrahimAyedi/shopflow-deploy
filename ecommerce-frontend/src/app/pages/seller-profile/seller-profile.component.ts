import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { resolveImageUrl } from '../../core/services/product.service';
import { SellerService } from '../../core/services/seller.service';
import { SellerProfile, SellerProfileRequest } from '../../models/seller.models';

@Component({
  selector: 'app-seller-profile',
  templateUrl: './seller-profile.component.html',
  styleUrls: ['./seller-profile.component.css']
})
export class SellerProfileComponent implements OnInit {
  profile: SellerProfile | null = null;
  formModel: SellerProfileRequest = this.createEmptyProfile();
  loading = false;
  submitting = false;
  errorMessage = '';
  actionMessage = '';
  actionErrorMessage = '';
  resolveLogoUrl = resolveImageUrl;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.actionMessage = '';
    this.actionErrorMessage = '';

    this.sellerService.getProfile().subscribe({
      next: profile => {
        this.profile = profile;
        this.formModel = {
          nomBoutique: profile.nomBoutique ?? '',
          description: profile.description ?? '',
          logo: profile.logo ?? ''
        };
        this.loading = false;
      },
      error: error => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.profile = null;
          this.formModel = this.createEmptyProfile();
          this.actionMessage = 'No seller profile found yet. Fill the form to create one.';
          this.loading = false;
          return;
        }

        this.errorMessage = this.getErrorMessage(error, 'Failed to load seller profile');
        this.loading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.actionErrorMessage = 'Boutique name is required.';
      return;
    }

    this.submitting = true;

    this.sellerService.updateProfile(this.prepareRequest()).subscribe({
      next: profile => {
        this.profile = profile;
        this.formModel = {
          nomBoutique: profile.nomBoutique ?? '',
          description: profile.description ?? '',
          logo: profile.logo ?? ''
        };
        this.actionMessage = 'Seller profile saved.';
        this.submitting = false;
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to save seller profile');
        this.submitting = false;
      }
    });
  }

  private createEmptyProfile(): SellerProfileRequest {
    return {
      nomBoutique: '',
      description: '',
      logo: ''
    };
  }

  private prepareRequest(): SellerProfileRequest {
    return {
      nomBoutique: this.formModel.nomBoutique.trim(),
      description: this.formModel.description?.trim() || null,
      logo: this.formModel.logo?.trim() || null
    };
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
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

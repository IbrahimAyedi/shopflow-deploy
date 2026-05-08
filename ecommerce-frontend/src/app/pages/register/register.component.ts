import { Component, HostListener } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ApiErrorResponse, AuthRequest } from '../../models/auth.models';
import { SellerRequestService } from '../../core/services/seller-request.service';
import { SellerAccountRequestCreateRequest } from '../../models/seller-request.models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  credentials: AuthRequest = {
    email: '',
    password: ''
  };
  errorMessage = '';
  loading = false;
  showSellerRequestModal = false;
  sellerRequestSubmitting = false;
  sellerRequestErrorMessage = '';
  sellerRequestSuccessMessage = '';
  sellerRequestModel: SellerAccountRequestCreateRequest = this.createEmptySellerRequest();

  constructor(
    private authService: AuthService,
    private sellerRequestService: SellerRequestService,
    private router: Router
  ) {}

  // Registers a new customer account and redirects to the products page on success.
  onSubmit(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.credentials).subscribe({
      next: auth => {
        this.authService.saveAuth(auth);
        this.loading = false;
        void this.router.navigate(['/products']);
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Registration failed. Please try again.');
        this.loading = false;
      }
    });
  }

  // Opens the seller account request modal and pre-fills the email from the register form.
  openSellerRequestModal(): void {
    this.sellerRequestModel = this.createEmptySellerRequest();
    const typedEmail = this.credentials.email.trim();
    if (typedEmail) {
      this.sellerRequestModel.email = typedEmail;
    }

    this.sellerRequestErrorMessage = '';
    this.sellerRequestSuccessMessage = '';
    this.showSellerRequestModal = true;
  }

  closeSellerRequestModal(form?: NgForm): void {
    if (this.sellerRequestSubmitting) {
      return;
    }

    this.showSellerRequestModal = false;
    this.sellerRequestErrorMessage = '';
    form?.resetForm(this.sellerRequestModel);
  }

  onSellerRequestBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeSellerRequestModal();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.showSellerRequestModal) {
      this.closeSellerRequestModal();
    }
  }

  // Sends the seller account application to the backend for admin review.
  submitSellerRequest(form: NgForm): void {
    this.sellerRequestErrorMessage = '';
    this.sellerRequestSuccessMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.sellerRequestErrorMessage = 'Please fill all required seller request fields.';
      return;
    }

    this.sellerRequestSubmitting = true;

    this.sellerRequestService.createRequest(this.prepareSellerRequest(this.sellerRequestModel)).subscribe({
      next: () => {
        this.sellerRequestSuccessMessage = 'Your seller request has been sent. The administrator will review it.';
        this.sellerRequestSubmitting = false;
        this.sellerRequestModel = this.createEmptySellerRequest();
        form.resetForm(this.sellerRequestModel);
      },
      error: error => {
        this.sellerRequestErrorMessage = this.getErrorMessage(error, 'Could not send seller request. Please try again.');
        this.sellerRequestSubmitting = false;
      }
    });
  }

  private createEmptySellerRequest(): SellerAccountRequestCreateRequest {
    return {
      fullName: '',
      email: '',
      phone: '',
      shopName: '',
      shopDescription: '',
      address: '',
      message: ''
    };
  }

  private prepareSellerRequest(model: SellerAccountRequestCreateRequest): SellerAccountRequestCreateRequest {
    return {
      fullName: model.fullName.trim(),
      email: model.email.trim(),
      phone: model.phone.trim(),
      shopName: model.shopName.trim(),
      shopDescription: model.shopDescription?.trim() || null,
      address: model.address?.trim() || null,
      message: model.message?.trim() || null
    };
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

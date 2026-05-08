import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile, UpdateUserProfileRequest } from '../../models/profile.models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  formModel: UpdateUserProfileRequest = { fullName: '', phone: '', avatarUrl: '' };
  
  loading = false;
  submitting = false;
  errorMessage = '';
  actionMessage = '';
  actionErrorMessage = '';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  get isCustomer(): boolean { return this.authService.isCustomer(); }
  get isSeller(): boolean { return this.authService.isSeller(); }
  get isAdmin(): boolean { return this.authService.isAdmin(); }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.formModel = {
          fullName: profile.fullName || '',
          phone: profile.phone || '',
          avatarUrl: profile.avatarUrl || ''
        };
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load profile');
        this.loading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }

    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.submitting = true;

    const request: UpdateUserProfileRequest = {
      fullName: this.formModel.fullName?.trim() || null,
      phone: this.formModel.phone?.trim() || null,
      avatarUrl: this.formModel.avatarUrl?.trim() || null
    };

    this.profileService.updateProfile(request).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.actionMessage = 'Profile updated successfully.';
        this.submitting = false;
      },
      error: (error) => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to update profile');
        this.submitting = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  deactivateMyAccount(): void {
    const confirmed = window.confirm('Are you sure you want to deactivate your account? You will be logged out.');
    if (!confirmed) {
      return;
    }

    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.submitting = true;

    this.profileService.deactivateAccount().subscribe({
      next: () => {
        this.submitting = false;
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to deactivate account');
        this.submitting = false;
      }
    });
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as { message?: string; details?: Record<string, string> } | null;

      if (apiError?.message) {
        if (!apiError.details) {
            return apiError.message;
        }
        const detailMessages = Object.values(apiError.details);
        return detailMessages.length > 0 ? `${apiError.message}: ${detailMessages.join(', ')}` : apiError.message;
      }
    }
    return fallbackMessage;
  }
}

import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ApiErrorResponse, AuthRequest } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials: AuthRequest = {
    email: '',
    password: ''
  };
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Submits login credentials and redirects the user to their role-specific dashboard.
  onSubmit(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: auth => {
        this.authService.saveAuth(auth);
        this.loading = false;
        // Role-based redirect
        switch (auth.role) {
          case 'ADMIN':
            void this.router.navigate(['/admin/dashboard']);
            break;
          case 'SELLER':
            void this.router.navigate(['/seller/dashboard']);
            break;
          default:
            void this.router.navigate(['/home']);
            break;
        }
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Login failed. Please try again.');
        this.loading = false;
      }
    });
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

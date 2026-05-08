import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { SellerRequestService } from '../../core/services/seller-request.service';
import { ApiErrorResponse } from '../../models/auth.models';
import { SellerAccountRequest, SellerRequestStatus } from '../../models/seller-request.models';

@Component({
  selector: 'app-admin-seller-requests',
  templateUrl: './admin-seller-requests.component.html',
  styleUrls: ['./admin-seller-requests.component.css']
})
export class AdminSellerRequestsComponent implements OnInit {
  requests: SellerAccountRequest[] = [];
  loading = false;
  errorMessage = '';
  actionMessage = '';
  actionErrorMessage = '';
  processingId: number | null = null;
  approvedCredentials: { email: string; temporaryPassword: string } | null = null;

  constructor(private sellerRequestService: SellerRequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  get pendingRequests(): SellerAccountRequest[] {
    return this.requests.filter(request => request.status === 'PENDING');
  }

  get reviewedRequests(): SellerAccountRequest[] {
    return this.requests.filter(request => request.status !== 'PENDING');
  }

  get hasRequests(): boolean {
    return this.requests.length > 0;
  }

  // Loads all seller account requests (both pending and already reviewed) from the backend.
  loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.sellerRequestService.getRequests().subscribe({
      next: requests => {
        this.requests = requests;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load seller requests.');
        this.loading = false;
      }
    });
  }

  // Approves a seller request; the backend creates a SELLER account and returns temporary credentials.
  approveRequest(request: SellerAccountRequest): void {
    const confirmed = window.confirm(`Approve seller request for ${request.email}?`);
    if (!confirmed) {
      return;
    }

    this.clearActionState();
    this.processingId = request.id;

    this.sellerRequestService.approveRequest(request.id).subscribe({
      next: updatedRequest => {
        this.upsertRequest(updatedRequest);
        const sellerEmail = updatedRequest.sellerEmail || updatedRequest.email;
        const temporaryPassword = updatedRequest.temporaryPassword || updatedRequest.email;
        this.approvedCredentials = { email: sellerEmail, temporaryPassword };
        this.actionMessage = 'Seller account approved.';
        this.processingId = null;
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to approve seller request.');
        this.processingId = null;
      }
    });
  }

  // Rejects the seller request and updates its status in the list without a full reload.
  rejectRequest(request: SellerAccountRequest): void {
    const confirmed = window.confirm(`Reject seller request for ${request.email}?`);
    if (!confirmed) {
      return;
    }

    this.clearActionState();
    this.processingId = request.id;

    this.sellerRequestService.rejectRequest(request.id).subscribe({
      next: updatedRequest => {
        this.upsertRequest(updatedRequest);
        this.actionMessage = 'Seller request rejected.';
        this.processingId = null;
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to reject seller request.');
        this.processingId = null;
      }
    });
  }

  getStatusClass(status: SellerRequestStatus): string {
    if (status === 'APPROVED') {
      return 'status-success';
    }

    if (status === 'REJECTED') {
      return 'status-danger';
    }

    return 'status-warning';
  }

  trackByRequestId(_index: number, request: SellerAccountRequest): number {
    return request.id;
  }

  private upsertRequest(updatedRequest: SellerAccountRequest): void {
    this.requests = this.requests.map(request =>
      request.id === updatedRequest.id ? updatedRequest : request
    );
  }

  private clearActionState(): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.approvedCredentials = null;
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

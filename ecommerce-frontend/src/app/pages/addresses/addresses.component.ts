import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AddressService } from '../../core/services/address.service';
import { OrderService } from '../../core/services/order.service';
import { Address, AddressRequest } from '../../models/address.models';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.css']
})
export class AddressesComponent implements OnInit {
  addresses: Address[] = [];
  formModel: AddressRequest = this.createEmptyAddress();
  loading = false;
  submitting = false;
  settingPrincipalId: number | null = null;
  deletingAddressId: number | null = null;
  selectedAddressId: number | null = null;
  placingOrder = false;
  errorMessage = '';
  actionMessage = '';
  actionErrorMessage = '';

  constructor(
    private addressService: AddressService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  get hasAddresses(): boolean {
    return this.addresses.length > 0;
  }

  loadAddresses(): void {
    this.loading = true;
    this.errorMessage = '';

    this.addressService.getAddresses().subscribe({
      next: addresses => {
        this.addresses = addresses;
        this.selectDefaultAddress();
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to load addresses');
        this.loading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.actionErrorMessage = 'Please fill in all required address fields.';
      return;
    }

    this.submitting = true;

    this.addressService.addAddress(this.formModel).subscribe({
      next: () => {
        this.actionMessage = 'Address added.';
        this.submitting = false;
        form.resetForm(this.createEmptyAddress());
        this.formModel = this.createEmptyAddress();
        this.loadAddresses();
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to add address');
        this.submitting = false;
      }
    });
  }

  setPrincipal(address: Address): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.settingPrincipalId = address.id;

    this.addressService.setPrincipal(address.id).subscribe({
      next: updatedAddress => {
        this.addresses = this.addresses.map(item => ({
          ...item,
          principal: item.id === updatedAddress.id
        }));
        this.selectedAddressId = updatedAddress.id;
        this.actionMessage = 'Principal address updated.';
        this.settingPrincipalId = null;
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to set principal address');
        this.settingPrincipalId = null;
      }
    });
  }

  deleteAddress(address: Address): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';
    this.deletingAddressId = address.id;

    this.addressService.deleteAddress(address.id).subscribe({
      next: () => {
        this.addresses = this.addresses.filter(item => item.id !== address.id);
        if (this.selectedAddressId === address.id) {
          this.selectedAddressId = null;
          this.selectDefaultAddress();
        }
        this.actionMessage = 'Address deleted.';
        this.deletingAddressId = null;
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to delete address');
        this.deletingAddressId = null;
      }
    });
  }

  continueToOrder(): void {
    this.actionMessage = '';
    this.actionErrorMessage = '';

    if (!this.selectedAddressId) {
      this.actionErrorMessage = 'Please add an address first.';
      return;
    }

    this.placingOrder = true;

    this.orderService.placeOrder(this.selectedAddressId).subscribe({
      next: () => {
        this.actionMessage = 'Order placed.';
        this.placingOrder = false;
        void this.router.navigate(['/orders']);
      },
      error: error => {
        this.actionErrorMessage = this.getErrorMessage(error, 'Failed to place order');
        this.placingOrder = false;
      }
    });
  }

  selectAddress(address: Address): void {
    this.selectedAddressId = address.id;
  }

  private createEmptyAddress(): AddressRequest {
    return {
      rue: '',
      ville: '',
      codePostal: '',
      pays: '',
      principal: false
    };
  }

  private selectDefaultAddress(): void {
    if (this.addresses.length === 0) {
      this.selectedAddressId = null;
      return;
    }

    if (this.selectedAddressId && this.addresses.some(address => address.id === this.selectedAddressId)) {
      return;
    }

    const principalAddress = this.addresses.find(address => address.principal);
    this.selectedAddressId = principalAddress?.id ?? (this.addresses.length === 1 ? this.addresses[0].id : null);
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

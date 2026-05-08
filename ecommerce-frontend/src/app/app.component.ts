import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './core/services/auth.service';
import { AuthResponse } from './models/auth.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  dropdownOpen = false;
  showScrollTop = false;
  navSearchQuery = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get auth(): AuthResponse | null {
    return this.authService.getAuth();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isSeller(): boolean {
    return this.authService.isSeller();
  }

  get isCustomer(): boolean {
    return this.authService.isCustomer();
  }

  get isAuthPage(): boolean {
    return this.router.url.startsWith('/login') || this.router.url.startsWith('/register');
  }

  get logoRoute(): string {
    if (this.isAdmin) {
      return '/admin/dashboard';
    }

    if (this.isSeller) {
      return '/seller/dashboard';
    }

    if (this.isCustomer) {
      return '/home';
    }

    return '/login';
  }

  /** Show sidebar for admin/seller roles only */
  get showSidebar(): boolean {
    return this.isLoggedIn && (this.isAdmin || this.isSeller);
  }

  get userInitial(): string {
    const email = this.auth?.email;
    return email ? email.charAt(0).toUpperCase() : '?';
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.dropdownOpen = false;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  logout(): void {
    this.authService.logout();
    this.dropdownOpen = false;
    void this.router.navigate(['/login']);
  }

  onNavSearch(): void {
    const query = this.navSearchQuery.trim();
    if (query) {
      void this.router.navigate(['/products'], { queryParams: { search: query } });
    } else {
      void this.router.navigate(['/products']);
    }
  }
}

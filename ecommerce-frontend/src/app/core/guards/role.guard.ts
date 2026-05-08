import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { Role } from '../../models/auth.models';
//he4a bech ya3tik kol 7ad role mte3o admin ymechi admin user ymechi user ...
function checkRole(route: ActivatedRouteSnapshot, authService: AuthService, router: Router): boolean {
  if (!authService.isLoggedIn()) {
    void router.navigate(['/login']);
    return false;
  }

  const expectedRoles = route.data['roles'] as Role[];
  if (!expectedRoles || expectedRoles.length === 0) {
    return true; // No roles defined
  }

  if (authService.hasAnyRole(expectedRoles)) {
    return true;
  }

  // Role doesn't match — redirect to role-appropriate page
  const role = authService.getRole();
  if (role === 'ADMIN') {
    void router.navigate(['/admin/dashboard']);
  } else if (role === 'SELLER') {
    void router.navigate(['/seller/dashboard']);
  } else {
    void router.navigate(['/home']);
  }
  return false;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return checkRole(route, this.authService, this.router);
  }
}

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return checkRole(route, authService, router);
};

// lhena bech t3es 3la paget kol 7ad 3ando page mte3o ... 

import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
//lhena 3amlena authService.isLoggedIn() bech na3rfou itha l user logged in wela la ... 
// w itha ma logged inch bech y redirecti l login page ...
function canAccessProtectedRoute(authService: AuthService, router: Router): boolean {
  if (authService.isLoggedIn()) {
    return true;
  }

  void router.navigate(['/login']);
  return false;
}

@Injectable({
  providedIn: 'root'
})
//
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
// nest3meloh ll routing 
  canActivate(): boolean {
    return canAccessProtectedRoute(this.authService, this.router);
  }
}
//3mtlhem zouz bech ykoun projet comptaible ma3a 2 sytles
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return canAccessProtectedRoute(authService, router);
};

// ken user 3ando token yzido fi requset w ken ma3andouch token y redirecti l login page
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token from the service.
    const token = this.authService.getToken();
    //copie mel request 
    let authReq = request;
    //ken token ykoun mawjouda nzidouha fi header mte3 request
    if (token) {
      authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    //lehna requset ll backend w ken 3andna error 401 (Unauthorized) y redirecti l login page
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // logout user w redirecti l login page
          const isAuthUrl = request.url.includes('/api/auth/login') || request.url.includes('/api/auth/register');
          if (!isAuthUrl) {
            this.authService.logout();
            void this.router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}

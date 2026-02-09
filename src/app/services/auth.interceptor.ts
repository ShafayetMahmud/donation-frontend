import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   constructor(private authService: AuthService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     // Skip any non-API requests
//     if (!req.url.includes('/api/')) return next.handle(req);

//     return from(this.authService.getAccessToken()).pipe(
//  switchMap(token => {
//   console.log('AuthInterceptor token:', token);
//   if (!token) return next.handle(req);

//   const authReq = req.clone({
//     setHeaders: { Authorization: `Bearer ${token}` }
//   });

//   return next.handle(authReq);
// })
// );
//   }
// }

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {

    const isApiCall =
      req.url.startsWith(environment.apiBaseUrl) ||
      req.url.startsWith('/api');

    if (!isApiCall) {
      return next.handle(req);
    }

    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {

        if (!token) {
          return next.handle(req);
        }

        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Interceptor URL:", req.url);

        return next.handle(authReq);
      })
    );
  }

}


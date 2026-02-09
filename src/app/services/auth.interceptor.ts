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

  constructor(private authService: AuthService) {}

  //old

  // intercept(req: HttpRequest<any>, next: HttpHandler) {

  //   return from(this.authService.getAccessToken()).pipe(
  //     switchMap(token => {

  //       // If no token (anonymous), pass request through
  //       if (!token) {
  //         return next.handle(req);
  //       }

  //       const authReq = req.clone({
  //         setHeaders: {
  //           Authorization: `Bearer ${token}`
  //         }
  //       });

  //       console.log('AuthInterceptor token:', token);

  //       return next.handle(authReq);
  //     })
  //   );
  // }

  //old

  //new

  intercept(req: HttpRequest<any>, next: HttpHandler) {

  // ⭐ ONLY attach token to your backend API
  if (!req.url.includes(environment.apiBaseUrl)) {
    return next.handle(req);
  }

  return from(this.authService.getAccessToken()).pipe(
    switchMap(token => {

      if (!token) return next.handle(req);

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next.handle(authReq);
    })
  );
}


  //new
}


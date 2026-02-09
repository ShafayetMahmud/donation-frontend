import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // constructor(private authService: AuthService) { }
  // intercept(req: HttpRequest<any>, next: HttpHandler) {

  //   const isApiCall =
  //     req.url.startsWith(environment.apiBaseUrl) ||
  //     req.url.startsWith('/api');

  //   if (!isApiCall) {
  //     return next.handle(req);
  //   }

  //   return from(this.authService.getAccessToken()).pipe(
  //     switchMap(token => {

  //       if (!token) {
  //         return next.handle(req);
  //       }

  //       const authReq = req.clone({
  //         setHeaders: {
  //           Authorization: `Bearer ${token}`
  //         }
  //       });
  //       console.log("Interceptor URL:", req.url);

  //       return next.handle(authReq);
  //     })
  //   );
  // }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let token = localStorage.getItem('msal.idtoken'); // your existing method

    // fallback: read token from cookie if local storage is empty
    if (!token) {
      const match = document.cookie.match(/msal_id_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }

}


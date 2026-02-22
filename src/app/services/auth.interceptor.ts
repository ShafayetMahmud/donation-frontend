import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const isApiCall = req.url.startsWith(environment.apiBaseUrl);
  if (!isApiCall) return next.handle(req);

  return from(this.authService.getAccessToken()).pipe(
    switchMap(token => {
      // fallback: read cookie if token is null
      if (!token) {
        const match = document.cookie.match(/access_token=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }

      if (!token) return next.handle(req);

      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      return next.handle(authReq);
    })
  );
}

}


import { Injectable, NgZone } from '@angular/core';
import { PublicClientApplication, AuthenticationResult, PopupRequest } from '@azure/msal-browser';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, BehaviorSubject } from 'rxjs';

interface AppUser {
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private pca: PublicClientApplication;
  private initialized = false;
  // private _userSubject = new BehaviorSubject<AppUser | null>(null);
  private _userSubject = new BehaviorSubject<{ email: string; name: string; role: string } | null>(null);
  public user$ = this._userSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone) {
    this.pca = new PublicClientApplication({
      auth: {
        clientId: environment.msalConfig.auth.clientId,
        authority: environment.msalConfig.auth.authority,
        redirectUri: environment.msalConfig.auth.redirectUri,
      },
      cache: {
        cacheLocation: environment.msalConfig.cache.cacheLocation as 'localStorage' | 'sessionStorage',
        storeAuthStateInCookie: environment.msalConfig.cache.storeAuthStateInCookie
      }
    });
  }

  setCurrentUser(user: { email: string; name: string; role: string }) {
    this._userSubject.next(user);
  }


  private async ensureInitialized() {
    if (!this.initialized) {
      await this.pca.initialize();
      this.initialized = true;
    }
  }

  async getCurrentUser() {
    return this._userSubject.value;
  }

  // async loginPopup(): Promise<AuthenticationResult> {
  //   await this.ensureInitialized();
  //   const result = await this.pca.loginPopup({ scopes: ['openid', 'profile', 'email'] });

    
  //   const resp: any = await this.exchangeIdToken(result.idToken);

  //   this._userSubject.next({
  //     email: resp.email || result.account?.username || '',
  //     name: resp.name || result.account?.name || result.account?.username || '',
  //     role: resp.role || 'AppUser'
  //   });

  //   return result;
  // }

  async loginPopup(): Promise<AuthenticationResult> {
    await this.ensureInitialized();
    const result = await this.pca.loginPopup({ scopes: ['openid', 'profile', 'email'] });
    const resp: any = await this.exchangeIdToken(result.idToken);

    // ⚡ Force change detection
    this.ngZone.run(() => {
      this._userSubject.next({
        email: resp.email || result.account?.username || '',
        name: resp.name || result.account?.name || result.account?.username || '',
        role: resp.role || 'AppUser'
      });
    });

    return result;
}



  async exchangeIdToken(idToken: string) {
    const resp: any = await firstValueFrom(
      this.http.post(`${environment.apiBaseUrl}/auth/exchange-token`, { idToken }, { withCredentials: true })
    );
    // Store role if needed: resp.role
    return resp;
  }

  async logout() {
    // 🔹 1. Call backend logout to clear your app session cookie
    try {
      await firstValueFrom(
        this.http.post(
          `${environment.apiBaseUrl}/auth/logout`,
          {},
          { withCredentials: true }
        )
      );
      console.log('Backend logout successful.');
    } catch (err) {
      console.warn('Backend logout failed (maybe already logged out).');
    }

    // 🔹 2. Clear frontend user state
    this._userSubject.next(null);
    // 🔹 3. Do NOT call MSAL logout
    // The Microsoft session remains active, so no popup appears
  }


}

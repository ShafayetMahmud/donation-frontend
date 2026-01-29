import { Injectable, NgZone } from '@angular/core';
import { PublicClientApplication, AuthenticationResult, PopupRequest } from '@azure/msal-browser';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  aud: string;
  iss: string;
  exp: number;
  iat: number;
  name: string;
  preferred_username: string;
  tid: string;
  [key: string]: any;
}

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

  async getApiToken(): Promise<string> {
    const result = await this.pca.acquireTokenSilent({
      scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
    }).catch(async () => {
      return this.pca.acquireTokenPopup({
        scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
      });
    });

    localStorage.setItem('access_token', result.accessToken);
    return result.accessToken;
  }

  getTokenPayload(): JwtPayload | null {
    const token = this.getAccessTokenSync();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (e) {
      console.error("Invalid JWT:", e);
      return null;
    }
  }

  getAccessTokenSync(): string | null {
    return localStorage.getItem('access_token');
  }

  checkAudience(expectedAud: string) {
    const payload = this.getTokenPayload();
    if (!payload) return false;

    console.log("Token payload:", payload);
    return payload.aud === expectedAud;
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

  async loginPopup(): Promise<AuthenticationResult> {
    await this.ensureInitialized();

    const result = await this.pca.loginPopup({
      scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
    });

    localStorage.setItem('access_token', result.accessToken);

    await firstValueFrom(
    this.http.get(`${environment.apiBaseUrl}/auth/me`)
  );


    this.ngZone.run(() => {
      this._userSubject.next({
        email: result.account?.username ?? '',
        name: result.account?.name ?? result.account?.username ?? '',
        role: 'AppUser'
      });
      const expectedAud = '99d94324-a3a8-4ace-b4b2-0ae093229b62';
      if (!this.checkAudience(expectedAud)) {
        console.warn("Warning: Token audience does not match API!");
      } else {
        console.log("Token audience ✅ matches API");
      }
    });

    return result;
  }

  async logout() {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiBaseUrl}/auth/logout`, {
          refreshToken: localStorage.getItem('refresh_token')
        })
      );
    } catch { }

    this.clearTokens();
    this._userSubject.next(null);
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const accounts = this.pca.getAllAccounts();
      if (!accounts || accounts.length === 0) return null;

      const silentRequest = {
        account: accounts[0],
        scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
      };

      const result = await this.pca.acquireTokenSilent(silentRequest).catch(async () => {
        return this.pca.acquireTokenPopup(silentRequest);
      });

      localStorage.setItem('access_token', result.accessToken);
      return result.accessToken;
    } catch (err) {
      console.error('Failed to get API token', err);
      return null;
    }
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

}

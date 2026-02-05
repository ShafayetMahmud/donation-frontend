import { Injectable, NgZone } from '@angular/core';
import { PublicClientApplication, AuthenticationResult, EventType } from '@azure/msal-browser';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { MsalService } from '@azure/msal-angular';

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

export interface AppUser {
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userSubject = new BehaviorSubject<AppUser | null>(null);
  public user$: Observable<AppUser | null> = this._userSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone, private msalService: MsalService) {
    this.listenToMsalEvents();
    this.restoreUserFromCookie(); // restore user immediately on service init
  }

  /** ---------------- MSAL EVENT LISTENER ---------------- */
  private listenToMsalEvents() {
    this.msalService.instance.addEventCallback((event) => {
      if (
        event.eventType === EventType.LOGIN_SUCCESS ||
        event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
      ) {
        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          this.ngZone.run(() => {
            const user: AppUser = {
              email: account.username ?? '',
              name: account.name ?? account.username ?? '',
              role: 'AppUser'
            };
            this._userSubject.next(user);

            // ✅ Set cookie AFTER login for subdomain usage
            const idToken = this.getIdToken();
            if (idToken) {
              this.setCookie('msal_id_token', idToken, 7); // 7 days
            }
          });
        }
      }
    });
  }

  /** ---------------- RESTORE USER ON SUBDOMAIN ---------------- */
  async restoreUserOnSubdomain(): Promise<boolean> {
    const idToken = this.getCookie('msal_id_token');
    if (!idToken) return false;

    try {
      const payload = jwtDecode<JwtPayload>(idToken);

      this._userSubject.next({
        email: payload.preferred_username,
        name: payload.name,
        role: 'AppUser'
      });

      // Optional: set as active account in MSAL for token acquisition
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts.length === 0) {
        this.msalService.instance.setActiveAccount({
          idTokenClaims: payload,
          username: payload.preferred_username,
          name: payload.name
        } as any);
      }

      return true;
    } catch (err) {
      console.warn('Failed to restore user on subdomain', err);
      return false;
    }
  }

  async loginOnSubdomainIfNeeded(): Promise<void> {
  const restored = await this.restoreUserOnSubdomain();
  if (!restored) {
    // fallback to redirect login
    await this.msalService.loginRedirect({
      scopes: environment.loginRequest.scopes,
      redirectStartPage: window.location.href
    });
  }
}


  /** ---------------- RESTORE USER FROM MSAL (MAIN DOMAIN) ---------------- */
  async restoreUserFromMsal(): Promise<void> {
    await this.msalService.instance.initialize();
    await this.msalService.instance.handleRedirectPromise();

    let accounts = this.msalService.instance.getAllAccounts();

    // ⭐ If no cached account, try silent SSO
    if (accounts.length === 0) {
      try {
        const result = await this.msalService.instance.ssoSilent({
          scopes: environment.loginRequest.scopes
        });
        accounts = [result.account!];
      } catch (e) {
        console.log('SSO silent failed — user not logged in yet');
        return;
      }
    }

    const account = accounts[0];
    this.msalService.instance.setActiveAccount(account);

    try {
      await this.msalService.instance.acquireTokenSilent({
        account,
        scopes: environment.loginRequest.scopes
      });

      this._userSubject.next({
        email: account.username ?? '',
        name: account.name ?? account.username ?? '',
        role: 'AppUser'
      });

    } catch (e) {
      console.warn('Silent token failed', e);
    }
  }

  /** ---------------- RESTORE USER FROM COOKIE ---------------- */
  restoreUserFromCookie() {
    const idToken = this.getCookie('msal_id_token');
    if (idToken) {
      try {
        const payload = jwtDecode<JwtPayload>(idToken);
        const user: AppUser = {
          email: payload.preferred_username,
          name: payload.name,
          role: 'AppUser'
        };
        this._userSubject.next(user);
      } catch (err) {
        console.warn('Invalid cookie token', err);
      }
    }
  }

  /** ---------------- ACCESS TOKEN METHODS ---------------- */
  async getAccessToken(): Promise<string | null> {
    const accounts = this.msalService.instance.getAllAccounts();
    if (!accounts || accounts.length === 0) return null;

    try {
      const silentRequest = {
        account: accounts[0],
        scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
      };
      const result: AuthenticationResult = await this.msalService.instance.acquireTokenSilent(silentRequest)
        .catch(() => this.msalService.instance.acquireTokenPopup(silentRequest));

      localStorage.setItem('access_token', result.accessToken);
      return result.accessToken;
    } catch (err) {
      console.error('Failed to get API token', err);
      return null;
    }
  }

  getAccessTokenSync(): string | null {
    return localStorage.getItem('access_token');
  }

  getTokenPayload(): JwtPayload | null {
    const token = this.getAccessTokenSync();
    if (!token) return null;
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (err) {
      console.error('Invalid JWT:', err);
      return null;
    }
  }

  checkAudience(expectedAud: string): boolean {
    const payload = this.getTokenPayload();
    if (!payload) return false;
    return payload.aud === expectedAud;
  }

  get currentUser(): AppUser | null {
    return this._userSubject.value;
  }

  setCurrentUser(user: AppUser) {
    this._userSubject.next(user);
  }

  /** ---------------- LOGOUT ---------------- */
  async logout() {
    this._userSubject.next(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.deleteCookie('msal_id_token');

    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      await this.msalService.logoutRedirect({ account: accounts[0] });
    }
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /** ---------------- COOKIE HELPERS ---------------- */
  private setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; path=/; domain=.mudhammataan.com; SameSite=None; Secure; Expires=${expires}`;
  }

  private getCookie(name: string): string | null {
    const matches = document.cookie.match(new RegExp(
      '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
    ));
    return matches ? decodeURIComponent(matches[1]) : null;
  }

  private deleteCookie(name: string) {
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.mudhammataan.com; SameSite=Lax; Secure`;
  }

  /** ---------------- HELPER TO GET MSAL ID TOKEN ---------------- */
  private getIdToken(): string {
    const accounts = this.msalService.instance.getAllAccounts();
    if (!accounts || accounts.length === 0) return '';
    const account = this.msalService.instance.getActiveAccount() || accounts[0];
    const idToken = (account?.idTokenClaims as any)?.rawIdToken;
    return idToken || '';
  }
}

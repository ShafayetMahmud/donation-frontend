import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { EventType } from '@azure/msal-browser';

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
    this.restoreUserFromCookie();
  }

  /** ---------------- MSAL EVENT LISTENER ---------------- */
  private listenToMsalEvents() {
  this.msalService.instance.addEventCallback((event) => {
    if (
      event.eventType === EventType.LOGIN_SUCCESS ||       // string
      event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS // string
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

          const idToken = this.getIdToken();
          if (idToken) {
            this.setCookie('msal_id_token', idToken, 7);
          }
        });
      }
    }
  });
}

/** ---------------- ACCESS TOKEN METHODS ---------------- */
async getAccessToken(): Promise<string | null> {
  const accounts = this.msalService.instance.getAllAccounts();
  if (!accounts || accounts.length === 0) return null;

  try {
    const silentRequest = {
      account: accounts[0],
      scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user'] // your API scope
    };

    const result = await this.msalService.instance.acquireTokenSilent(silentRequest)
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



  /** ---------------- SUBDOMAIN LOGIN FLOW ---------------- */
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
      return true;
    } catch {
      return false;
    }
  }

  async loginOnSubdomainIfNeeded() {
    if (!await this.restoreUserOnSubdomain()) {
      // Redirect to main domain login with returnUrl pointing to current subdomain
      const mainDomainLogin = `https://mudhammataan.com/login?returnUrl=${encodeURIComponent(window.location.href)}`;
      window.location.href = mainDomainLogin;
    }
  }

  /** ---------------- MAIN DOMAIN LOGIN ---------------- */
  async restoreUserFromMsal(): Promise<void> {
    await this.msalService.instance.initialize();
    await this.msalService.instance.handleRedirectPromise();

    let accounts = this.msalService.instance.getAllAccounts();

    if (accounts.length === 0) {
      try {
        const result = await this.msalService.instance.ssoSilent({
          scopes: environment.loginRequest.scopes
        });
        accounts = [result.account!];
      } catch {
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

  /** ---------------- RESTORE FROM COOKIE ---------------- */
  restoreUserFromCookie() {
    const idToken = this.getCookie('msal_id_token');
    if (!idToken) return;

    try {
      const payload = jwtDecode<JwtPayload>(idToken);
      this._userSubject.next({
        email: payload.preferred_username,
        name: payload.name,
        role: 'AppUser'
      });
    } catch {}
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

  public deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; domain=.mudhammataan.com; SameSite=Lax; Secure`;
}


  private getIdToken(): string {
    const accounts = this.msalService.instance.getAllAccounts();
    if (!accounts || accounts.length === 0) return '';
    const account = this.msalService.instance.getActiveAccount() || accounts[0];
    return (account.idTokenClaims as any)?.rawIdToken || '';
  }

  get currentUser(): AppUser | null {
    return this._userSubject.value;
  }
  /** ---------------- LOGOUT ---------------- */
async logout() {
  // Clear local state
  this._userSubject.next(null);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  this.deleteCookie('msal_id_token');

  // Logout from MSAL
  const accounts = this.msalService.instance.getAllAccounts();
  if (accounts.length > 0) {
    try {
      await this.msalService.logoutRedirect({
        account: accounts[0],
        postLogoutRedirectUri: 'https://mudhammataan.com' // main domain landing after logout
      });
    } catch (err) {
      console.error('MSAL logout failed', err);
      // Fallback: redirect manually
      window.location.href = 'https://mudhammataan.com';
    }
  } else {
    // No MSAL account → just redirect to main domain
    window.location.href = 'https://mudhammataan.com';
  }
}

}

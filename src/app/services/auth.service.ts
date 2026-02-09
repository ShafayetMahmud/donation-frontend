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

            // Write cookie so subdomains can read
            const idToken = this.getIdToken();
            if (idToken) this.setCookie('msal_id_token', idToken, 7);
          });
        }
      }
    });
  }

  /** ---------------- ACCESS TOKEN ---------------- */
  // async getAccessToken(): Promise<string | null> {
  //   const accounts = this.msalService.instance.getAllAccounts();
  //   if (!accounts || accounts.length === 0) return null;

  //   try {
  //     const silentRequest = {
  //       account: accounts[0],
  //       scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
  //     };

  //     const result = await this.msalService.instance.acquireTokenSilent(silentRequest)
  //       .catch(() => this.msalService.instance.acquireTokenPopup(silentRequest));

  //     localStorage.setItem('access_token', result.accessToken);
  //     return result.accessToken;
  //   } catch (err) {
  //     console.error('Failed to get API token', err);
  //     return null;
  //   }
  // }

  async getAccessToken(): Promise<string | null> {
  const accounts = this.msalService.instance.getAllAccounts();
  if (!accounts || accounts.length === 0) return null;

  try {
    const silentRequest = {
      account: accounts[0],
      scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
    };

    const result = await this.msalService.instance.acquireTokenSilent(silentRequest)
      .catch(() => this.msalService.instance.acquireTokenPopup(silentRequest));

    const token = result.accessToken;

    // Store in localStorage (main domain)
    localStorage.setItem('access_token', token);

    // Also store in a cookie shared across all subdomains
    document.cookie = `access_token=${token}; domain=.mudhammataan.com; path=/; secure; SameSite=None`;

    return token;
  } catch (err) {
    console.error('Failed to get API token', err);
    return null;
  }
}


  getAccessTokenSync(): string | null {
    return localStorage.getItem('access_token');
  }

  /** ---------------- SUBDOMAIN LOGIN FLOW (SILENT) ---------------- */
  //working old
  // async restoreUserOnSubdomain(): Promise<boolean> {
  //   const idToken = this.getCookie('msal_id_token');
  //   if (idToken) {
  //     const payload = jwtDecode<JwtPayload>(idToken);
  //     this._userSubject.next({
  //       email: payload.preferred_username,
  //       name: payload.name,
  //       role: 'AppUser'
  //     });
  //     return true;
  //   }

  //   try {
  //     const accounts = this.msalService.instance.getAllAccounts();
  //     if (accounts.length > 0) {
  //       const silentRequest = {
  //         account: accounts[0],
  //         scopes: environment.loginRequest.scopes,
  //         redirectUri: window.location.origin + '/login'
  //       };
  //       const result = await this.msalService.instance.ssoSilent(silentRequest);
  //       if (result?.account) {
  //         this.msalService.instance.setActiveAccount(result.account);

  //         const idTokenFromResult = (result.account.idTokenClaims as any)?.rawIdToken;
  //         if (idTokenFromResult) this.setCookie('msal_id_token', idTokenFromResult, 7);

  //         this._userSubject.next({
  //           email: result.account.username ?? '',
  //           name: result.account.name ?? result.account.username ?? '',
  //           role: 'AppUser'
  //         });
  //         return true;
  //       }
  //     }
  //   } catch {
  //     console.warn('[Auth] Silent login failed on subdomain, user not logged in yet');
  //   }

  //   return false;
  // }
  //working old

  //new

  async restoreUserOnSubdomain(): Promise<boolean> {
  const idToken = this.getCookie('msal_id_token');
  if (idToken) {
    const payload = jwtDecode<JwtPayload>(idToken);

    this._userSubject.next({
      email: payload.preferred_username,
      name: payload.name,
      role: 'AppUser'
    });

    // ⭐ ENSURE API TOKEN EXISTS
    await this.getAccessToken();

    return true;
  }

  try {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {

      const silentRequest = {
        account: accounts[0],
        scopes: environment.loginRequest.scopes,
        redirectUri: window.location.origin + '/login'
      };

      const result = await this.msalService.instance.ssoSilent(silentRequest);

      if (result?.account) {
        this.msalService.instance.setActiveAccount(result.account);

        const idTokenFromResult = (result.account.idTokenClaims as any)?.rawIdToken;
        if (idTokenFromResult) this.setCookie('msal_id_token', idTokenFromResult, 7);

        this._userSubject.next({
          email: result.account.username ?? '',
          name: result.account.name ?? result.account.username ?? '',
          role: 'AppUser'
        });

        // ⭐ ADD THIS
        await this.getAccessToken();

        return true;
      }
    }
  } catch {
    console.warn('[Auth] Silent login failed on subdomain');
  }

  return false;
}


  //new



  async loginOnSubdomainIfNeeded() {
    // Only try to restore, do NOT redirect immediately
    await this.restoreUserOnSubdomain();
  }

  /** ---------------- MAIN DOMAIN LOGIN ---------------- */
  async restoreUserFromMsal(): Promise<void> {

  await this.msalService.instance.initialize();

  const result = await this.msalService.instance.handleRedirectPromise();

  // ⭐ This contains the real ID token
  if (result?.idToken) {
    this.setCookie('msal_id_token', result.idToken, 7);
  }

  const accounts = this.msalService.instance.getAllAccounts();
  if (accounts.length === 0) return;

  const account = accounts[0];
  this.msalService.instance.setActiveAccount(account);

  this._userSubject.next({
    email: account.username ?? '',
    name: account.name ?? account.username ?? '',
    role: 'AppUser'
  });

  console.log('[Auth] User restored on main domain');
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
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.mudhammataan.com; SameSite=None; Secure`;
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
  // async logout() {
  //   this._userSubject.next(null);
  //   localStorage.removeItem('access_token');
  //   localStorage.removeItem('refresh_token');
  //   this.deleteCookie('msal_id_token');

  //   const accounts = this.msalService.instance.getAllAccounts();
  //   if (accounts.length > 0) {
  //     try {
  //       await this.msalService.logoutRedirect({
  //         account: accounts[0],
  //         postLogoutRedirectUri: 'https://mudhammataan.com'
  //       });
  //     } catch (err) {
  //       console.error('MSAL logout failed', err);
  //       window.location.href = 'https://mudhammataan.com';
  //     }
  //   } else {
  //     window.location.href = 'https://mudhammataan.com';
  //   }
  // }
  async logout(): Promise<void> {

    this._userSubject.next(null);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  this.deleteCookie('msal_id_token');

  const currentUrl = window.location.href;
  const isSubdomain = window.location.hostname !== 'mudhammataan.com';

  // If logout initiated from subdomain → route through main domain
  if (isSubdomain) {

    const encodedReturn = encodeURIComponent(currentUrl);

    window.location.href =
      `https://mudhammataan.com/logout?returnUrl=${encodedReturn}`;

    return;
  }

  // MAIN DOMAIN LOGOUT FLOW
  await this.msalService.logoutRedirect({
    postLogoutRedirectUri: window.location.origin
  });
}

}

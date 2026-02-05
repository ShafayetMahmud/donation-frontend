// import { Injectable, NgZone } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject } from 'rxjs';
// import { jwtDecode } from 'jwt-decode';
// import { MsalService } from '@azure/msal-angular';
// import { EventType } from '@azure/msal-browser';

// export interface JwtPayload {
//   aud: string;
//   iss: string;
//   exp: number;
//   iat: number;
//   name: string;
//   preferred_username: string;
//   tid: string;
//   [key: string]: any;
// }

// interface AppUser {
//   email: string;
//   name: string;
//   role: string;
// }

// @Injectable({
//   providedIn: 'root'
// })

// export class AuthService {
//   private _userSubject = new BehaviorSubject<{ email: string; name: string; role: string } | null>(null);
//   public user$ = this._userSubject.asObservable();

//   constructor(private http: HttpClient, private ngZone: NgZone, private msalService: MsalService) {
//     this.listenToMsalEvents();
//   }

//   private listenToMsalEvents() {
//     this.msalService.instance.addEventCallback((event) => {
//       if (
//         event.eventType === EventType.LOGIN_SUCCESS ||
//         event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
//       ) {
//         const accounts = this.msalService.instance.getAllAccounts();
//         if (accounts.length > 0) {
//           const account = accounts[0];

//           this.ngZone.run(() => {
//             this._userSubject.next({
//               email: account.username ?? '',
//               name: account.name ?? account.username ?? '',
//               role: 'AppUser'
//             });
//           });
//         }
//       }
//     });
//   }

//   async getAccessToken(): Promise<string | null> {
//     const accounts = this.msalService.instance.getAllAccounts();
//     if (!accounts || accounts.length === 0) return null;
//     try {
//       const silentRequest = {
//         account: accounts[0],
//         scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
//       };
//       const result = await this.msalService.instance.acquireTokenSilent(silentRequest)
//         .catch(() => this.msalService.instance.acquireTokenPopup(silentRequest));

//       localStorage.setItem('access_token', result.accessToken);
//       return result.accessToken;
//     } catch (err) {
//       console.error('Failed to get API token', err);
//       return null;
//     }
//   }

//   getTokenPayload(): JwtPayload | null {
//     const token = this.getAccessTokenSync();
//     if (!token) return null;
//     try {
//       return jwtDecode<JwtPayload>(token);
//     } catch (e) {
//       console.error("Invalid JWT:", e);
//       return null;
//     }
//   }

//   getAccessTokenSync(): string | null {
//     return localStorage.getItem('access_token');
//   }

//   checkAudience(expectedAud: string) {
//     const payload = this.getTokenPayload();
//     if (!payload) return false;

//     console.log("Token payload:", payload);
//     return payload.aud === expectedAud;
//   }

//   setCurrentUser(user: { email: string; name: string; role: string }) {
//     this._userSubject.next(user);
//   }

//   get currentUser() {
//     return this._userSubject.value;
//   }

//   async restoreUserFromMsal(): Promise<void> {
//     await this.msalService.instance.initialize();
//     const accounts = this.msalService.instance.getAllAccounts();
//     if (accounts.length > 0) {
//       const account = accounts[0];

//       this._userSubject.next({
//         email: account.username ?? '',
//         name: account.name ?? account.username ?? '',
//         role: 'AppUser'
//       });
//     }
//   }

//   async logout() {
//     this._userSubject.next(null);
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');

//     const accounts = this.msalService.instance.getAllAccounts();
//     if (accounts.length > 0) {
//       await this.msalService.logoutRedirect({ account: accounts[0] });
//     }
//   }

//   clearTokens() {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//   }

// }

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
            this.setCookie('msal_id_token', this.getIdToken(), 7); // share across subdomains for 7 days
          });
        }
      }
    });
  }

  /** ---------------- RESTORE USER FROM MSAL ---------------- */
  // async restoreUserFromMsal(): Promise<void> {
  //   await this.msalService.instance.initialize();
  //   const accounts = this.msalService.instance.getAllAccounts();
  //   if (accounts.length > 0) {
  //     const account = accounts[0];
  //     const user: AppUser = {
  //       email: account.username ?? '',
  //       name: account.name ?? account.username ?? '',
  //       role: 'AppUser'
  //     };
  //     this._userSubject.next(user);
  //     this.setCookie('msal_id_token', this.getIdToken(), 7);
  //   }
  // }

  async restoreUserFromMsal(): Promise<void> {

  await this.msalService.instance.initialize();

  // VERY IMPORTANT
  await this.msalService.instance.handleRedirectPromise();

  const accounts = this.msalService.instance.getAllAccounts();

  if (accounts.length === 0) return;

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


  /** ---------------- RESTORE USER FROM COOKIE (SUBDOMAINS) ---------------- */
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
    document.cookie = `${name}=${value}; path=/; domain=.mudhammataan.com; SameSite=Lax; Secure`;
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
    const account = accounts[0];
    const idToken = (this.msalService.instance.getActiveAccount() || account)?.idTokenClaims as any;
    return idToken?.rawIdToken || '';
  }
}


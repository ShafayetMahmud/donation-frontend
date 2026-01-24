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

  private msalInstance = new PublicClientApplication({
    auth: {
      clientId: 'YOUR_CLIENT_ID',
      authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
      redirectUri: window.location.origin
    }
  });

  private apiToken: string | null = null;

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


//   async loginPopup(): Promise<AuthenticationResult> {
//   await this.ensureInitialized();

//   const result = await this.pca.loginPopup({
//     scopes: ['openid', 'profile', 'email']
//   });

//   this.ngZone.run(() => {
//   this._userSubject.next({
//     email: result.account?.username ?? '',
//     name: result.account?.name ?? result.account?.username ?? '',
//     role: 'AppUser'
//   });

//   localStorage.setItem('access_token', result.accessToken);
// });


//   return result;
// }

async loginPopup(): Promise<AuthenticationResult> {
  await this.ensureInitialized();

  const result = await this.pca.loginPopup({
    scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user'] // ✅ change this
  });

  this.ngZone.run(() => {
    this._userSubject.next({
      email: result.account?.username ?? '',
      name: result.account?.name ?? result.account?.username ?? '',
      role: 'AppUser'
    });

    localStorage.setItem('access_token', result.accessToken); // this will now be valid for your API
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
  } catch {}

  this.clearTokens();
  this._userSubject.next(null);
}


 async getAccessToken(): Promise<string | null> {
  return localStorage.getItem('access_token');
}


clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}


}

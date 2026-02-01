import { Injectable, NgZone } from '@angular/core';
import { PublicClientApplication, AuthenticationResult, PopupRequest } from '@azure/msal-browser';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
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

interface AppUser {
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private _userSubject = new BehaviorSubject<{ email: string; name: string; role: string } | null>(null);
  public user$ = this._userSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone, private msalService: MsalService) { }

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

      localStorage.setItem('access_token', result.accessToken);
      return result.accessToken;
    } catch (err) {
      console.error('Failed to get API token', err);
      return null;
    }
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

  async getCurrentUser() {
    return this._userSubject.value;
  }

  // In AuthService
async initializeUserAfterRedirect(): Promise<void> {
  const accounts = this.msalService.instance.getAllAccounts();
  if (accounts.length > 0) {
    const account = accounts[0];
    this._userSubject.next({
      email: account.username ?? '',
      name: account.name ?? account.username ?? '',
      role: 'AppUser'
    });
  }
}


  async logout() {
    this._userSubject.next(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      await this.msalService.logoutRedirect({ account: accounts[0] });
    }
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

}

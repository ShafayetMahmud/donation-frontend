import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface Campaign {
  id: string;
  name: string;
  why: string;
  whatFor: string;
  how: string;
  contact: string;
  gallery: string[];
  subdomain: string;
}

@Injectable({ providedIn: 'root' })
export class SubdomainService {
  private _campaign$ = new BehaviorSubject<Campaign | null>(null);
  public campaign$ = this._campaign$.asObservable();

  private _loading$ = new BehaviorSubject<boolean>(true);
  public loading$ = this._loading$.asObservable();

  public subdomain: string | null = null;
  private readonly baseUrl = `${environment.apiBaseUrl}/campaign`;

  constructor(private http: HttpClient, private router: Router) {
    const urlParams = new URLSearchParams(window.location.search);
    this.subdomain = urlParams.get('subdomain');

    if (!this.subdomain && window.location.hostname !== 'localhost') {
      const parts = window.location.hostname.split('.');
      if (parts.length > 2) this.subdomain = parts[0];
    }

    if (this.subdomain) {
      this.fetchCampaign(this.subdomain);
    } else {
      this._loading$.next(false); // no subdomain, done loading
    }
  }

  private fetchCampaign(subdomain: string) {
    this._loading$.next(true);

    this.http.get<Campaign>(`${this.baseUrl}/by-subdomain/${subdomain}`).subscribe({
      next: (campaign) => {
        this._campaign$.next(campaign);
        this._loading$.next(false);
      },
      error: () => {
        this._campaign$.next(null);
        this._loading$.next(false);
        this.router.navigate(['/not-found']);
      }
    });
  }

  getCurrentCampaign() {
    return this._campaign$.getValue();
  }

  refreshCampaign(campaign: Campaign) {
    this._campaign$.next(campaign);
  }

  isSubdomain(): boolean {
    return !!this.subdomain;
  }
}

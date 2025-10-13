// services/subdomain.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
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
  public subdomain: string | null = null;
  private readonly baseUrl = `${environment.apiBaseUrl}/campaign`;

  constructor(private http: HttpClient, private router: Router) {
    const urlParams = new URLSearchParams(window.location.search);
    this.subdomain = urlParams.get('subdomain');

    // Only detect subdomain for production
    if (!this.subdomain && window.location.hostname !== 'localhost') {
      const hostname = window.location.hostname;

      // Only treat as subdomain if it's really *.mudhammataan.com
      if (hostname.endsWith('mudhammataan.com')) {
        const parts = hostname.split('.');
        if (parts.length === 3) {
          this.subdomain = parts[0]; // e.g. wildfirefundraising.mudhammataan.com
        }
      }
    }

    console.log('Detected subdomain:', this.subdomain);

    if (this.subdomain) {
      this.fetchCampaign(this.subdomain);
    }
  }

  /** Fetch campaign by subdomain */
  private fetchCampaign(subdomain: string) {
    this.http
      .get<Campaign>(`${this.baseUrl}/by-subdomain/${subdomain}`)
      .subscribe({
        next: (campaign) => {
          this._campaign$.next(campaign);
        },
        error: (err) => {
          console.warn(`No campaign found for subdomain: ${subdomain}`);
          this._campaign$.next(null);

          // if subdomain doesn't exist, redirect or route to not-found
          if (window.location.hostname.endsWith('mudhammataan.com')) {
            // Option 1: show in-site 404 page
            setTimeout(() => this.router.navigate(['/not-found']), 100);
            // Option 2: uncomment if you prefer redirect instead
            // window.location.href = 'https://mudhammataan.com';
          }
        },
      });
  }

  /** Get current campaign value */
  getCurrentCampaign(): Campaign | null {
    return this._campaign$.getValue();
  }

  /** Update existing campaign */
  updateCampaign(updated: Campaign) {
    return this.http
      .put<Campaign>(`${this.baseUrl}/update`, updated)
      .pipe(tap((campaign) => this._campaign$.next(campaign)));
  }

  /** Is current hostname a subdomain? */
  isSubdomain(): boolean {
    return !!this.subdomain;
  }

  /** Refresh campaign in memory */
  refreshCampaign(campaign: Campaign) {
    this._campaign$.next(campaign);
  }
}

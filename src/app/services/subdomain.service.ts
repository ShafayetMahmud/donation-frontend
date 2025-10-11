// services/subdomain.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {
    // Read query param for local dev
    const urlParams = new URLSearchParams(window.location.search);
    this.subdomain = urlParams.get('subdomain');

    // Or production: read hostname
    // if (!this.subdomain && window.location.hostname !== 'localhost') {
    //   this.subdomain = window.location.hostname.split('.')[0];
    // }
    if (!this.subdomain && window.location.hostname !== 'localhost') {
      const parts = window.location.hostname.split('.');
      if (parts.length > 2) {
        this.subdomain = parts[0]; // Only set if real subdomain
      }
    }

    if (this.subdomain) {
      this.fetchCampaign(this.subdomain);
    }
  }

  /** Fetch campaign by subdomain */
  private fetchCampaign(subdomain: string) {
    this.http
      .get<Campaign>(`${this.baseUrl}/by-subdomain/${subdomain}`)
      .subscribe({
        next: (campaign) => this._campaign$.next(campaign),
        error: (err) => console.error('Campaign not found', err),
      });
  }

  /** Expose the latest campaign value */
  getCurrentCampaign(): Campaign | null {
    return this._campaign$.getValue();
  }

  /** Update existing campaign AND refresh BehaviorSubject */
  // updateCampaign(updated: Campaign): Observable<Campaign> {
  //   return this.http.put<Campaign>(`${this.baseUrl}/${updated.id}`, updated)
  //     .pipe(
  //       tap((campaign) => {
  //         this._campaign$.next(campaign);
  //       })
  //     );
  // }

  updateCampaign(updated: Campaign) {
    return this.http.put<Campaign>(`${this.baseUrl}/update`, updated)
      .pipe(
        tap((campaign) => this._campaign$.next(campaign)) // updates BehaviorSubject automatically
      );
  }


  /** Helper: check if current hostname is a subdomain */
  isSubdomain(): boolean {
    return !!this.subdomain;
  }

  /** Refresh campaign from backend manually */
  // refreshCampaign() {
  //   if (this.subdomain) {
  //     this.fetchCampaign(this.subdomain);
  //   }
  // }

  /** Refresh the campaign in memory */
  refreshCampaign(campaign: Campaign) {
    this._campaign$.next(campaign);
  }

}

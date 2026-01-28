import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Campaign } from '../../models/campaign.model';

@Injectable({ providedIn: 'root' })
export class SubdomainService {
  private _campaign$ = new BehaviorSubject<Campaign | null>(null);
  public campaign$ = this._campaign$.asObservable();

  private _loading$ = new BehaviorSubject<boolean>(true);
  public loading$ = this._loading$.asObservable();

  public subdomain: string | null = null;
  private readonly baseUrl = `${environment.apiBaseUrl}/api/campaign`;

  private fallbackCampaigns: Campaign[] = [
    {
      id: 'almahadassaboor',
      name: 'Al-Mahad As-Saboor',
      why: '‘Al Mahad As Sabur’ means …',
      goals: 'provide shelter and education …',
      method: 'Children … will receive a Quran-centered education …',
      quote: '"I did not create jinn and humans except to worship Me.[51:56]"',
      missionquote: '"I did not create jinn and humans except to worship Me.[51:56]"',
      whatFor: 'Educational and spiritual initiatives under Al-Mahad As-Saboor.',
      descriptionone: 'The institute will sustain itself …',
      descriptiontwo: 'Children, typically between the ages of 6–8 …',
      descriptionthree: 'Through this comprehensive education …',
      descriptionfour: 'In Sha Allah, the students will be equipped …',
      how: 'Through teachings, programs, and charitable activities.',
      contact: '01700000000',
      gallery: [],
      subdomain: 'almahadassaboor'
    }
  ];

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
      this._loading$.next(false);
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
        const fallback = this.fallbackCampaigns.find(c => c.subdomain === subdomain);
        if (fallback) {
          this._campaign$.next(fallback);
        } else {
          this._campaign$.next(null);
          this.router.navigate(['/not-found']);
        }
        this._loading$.next(false);
      }
    });
  }

  getCurrentCampaign(): Campaign | null {
    return this._campaign$.getValue();
  }

  refreshCampaign(campaign: Campaign) {
    this._campaign$.next(campaign);
  }

  isSubdomain(): boolean {
    return !!this.subdomain;
  }

  isSpecialSubdomain(): boolean {
    return this.subdomain?.toLowerCase() === 'almahadassaboor';
  }
}

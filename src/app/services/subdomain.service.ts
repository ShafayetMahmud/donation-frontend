import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface Campaign {
  id: string;
  name: string;
  why: string;
  goals: string;
  method: string;
  quote: string;
  missionquote: string;
  whatFor: string;
  how: string;
  descriptionone: string;
  descriptiontwo: string;
  descriptionthree: string;
  descriptionfour: string;
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

  //Add fallback campaign(s)
  private fallbackCampaigns: Campaign[] = [
    {
      id: 'almahadassaboor',
      name: 'Al-Mahad As-Saboor',
      why: '‘Al Mahad As Sabur’ means ‘The Institute for Allah’. Sabur refers to The All-Patient, one of the beautiful names of Allah Subhanahu wa Ta’ala.',
      goals: 'provide shelter and education to orphans, spread Islamic upbringing to grow a better society, get rid of the divide between Islamic track and mainstream track',
      method: 'Children who are orphaned or needy, typically 6–18 years old, will receive a Quran-centered education. Through this education, students grow into individuals who understand how to please Allah and become leaders in society.',
      quote: '"I did not create jinn and humans except to worship Me.[51:56]"',
      missionquote: '"I did not create jinn and humans except to worship Me.[51:56]"',
      whatFor: 'Educational and spiritual initiatives under Al-Mahad As-Saboor.',
      descriptionone: 'The institute will sustain itself through its own income sources and Zakah from its benefactors, using these resources to provide shelter and education for the needy and orphaned children. Since Zakah will be utilized, expenditures will be strictly within the eight categories where Zakah is permissible.',
      descriptiontwo: 'Children, typically between the ages of 6-8 years and 16-18 years, will receive education centered around the Quran, including: Al-Qur’an (both memorization as Hafiz and understanding its meanings and Tafsir), As-Sunnah and Fiqh, Alongside worldly education in subjects such as Mathematics, Physics, Chemistry, Biology, and more. They will also learn technical training and business management.',
      descriptionthree: 'Through this comprehensive education, students will grow into individuals who understand how to please Allah Subhanahu wa Ta’ala, contribute to future generations, and become leaders in society.',
      descriptionfour: 'In Sha Allah, the students will be equipped to pursue higher education at any esteemed institution of their choice, whether it be BUET, RUET, DU, Medical Colleges, Al-Azhar University, or Al-Medina University, among others. In Sha Allah, they will be ready to start a new business or engage in professional life, if they choose to do so.',
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
      // error: () => {
      //   this._campaign$.next(null);
      //   this._loading$.next(false);
      //   this.router.navigate(['/not-found']);
      // }
      error: () => {
        // 🟢 If campaign not found in backend, check fallback list
        const fallback = this.fallbackCampaigns.find(c => c.subdomain === subdomain);
        if (fallback) {
          this._campaign$.next(fallback);
          this._loading$.next(false);
        } else {
          this._campaign$.next(null);
          this._loading$.next(false);
          this.router.navigate(['/not-found']);
        }
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

  isSpecialSubdomain(): boolean {
    return this.subdomain?.toLowerCase() === 'almahadassaboor';
  }
}

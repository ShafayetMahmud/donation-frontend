import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // getCampaignBySubdomain(subdomain: string): Observable<Campaign> {
  //   return this.http.get<Campaign>(`/api/campaign/by-subdomain/${subdomain}`);
  // }

  getCampaignBySubdomain(subdomain: string): Observable<Campaign> {
  return new Observable<Campaign>(observer => {
    this.auth.getAccessToken().then(token => {
      if (!token) {
        observer.error("No access token found. Login required.");
        return;
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      this.http.get<Campaign>(`/api/campaign/by-subdomain/${subdomain}`, { headers })
        .subscribe({
          next: data => observer.next(data),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
    });
  });
}

}

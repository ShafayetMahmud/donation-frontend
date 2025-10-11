// src/app/services/campaign.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  constructor(private http: HttpClient) {}

  getCampaignBySubdomain(subdomain: string): Observable<Campaign> {
    return this.http.get<Campaign>(`/api/campaign/by-subdomain/${subdomain}`);
  }
}

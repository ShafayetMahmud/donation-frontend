import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Campaign } from '../../models/campaign.model';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private baseUrl = `${environment.apiBaseUrl}/api/campaign`;

  constructor(private http: HttpClient) {}

  createCampaign(campaign: Campaign): Observable<Campaign> {
    // No need to manually attach token anymore
    return this.http.post<Campaign>(`${this.baseUrl}/create`, campaign);
  }

  updateCampaign(campaign: Campaign): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.baseUrl}/update`, campaign);
  }

  getCampaignBySubdomain(subdomain: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.baseUrl}/by-subdomain/${subdomain}`);
  }
}

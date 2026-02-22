import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Campaign } from '../../models/campaign.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private baseUrl = environment.apiBaseUrl + '/campaign'; //new

  constructor(private http: HttpClient, private authService: AuthService) { }

  private async getHeaders() {
    const token = await this.authService.getAccessToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      }),
      withCredentials: true
    };
  }

  async createCampaign(campaign: Campaign): Promise<Campaign> {
    const options = await this.getHeaders();
    const response = await this.http.post<Campaign>(`${this.baseUrl}/create`, campaign, options).toPromise();
    if (!response) throw new Error('No campaign returned from API'); // explicit safety
    return response;
  }

  async updateCampaign(campaign: Campaign): Promise<Campaign> {
    const options = await this.getHeaders();
    const response = await this.http.put<Campaign>(`${this.baseUrl}/update`, campaign, options).toPromise();
    if (!response) throw new Error('No campaign returned from API');
    return response;
  }

  async getCampaignBySubdomain(subdomain: string): Promise<Campaign> {
    const options = await this.getHeaders();
    const response = await this.http.get<Campaign>(`${this.baseUrl}/by-subdomain/${subdomain}`, options).toPromise();
    if (!response) throw new Error('No campaign returned from API');
    return response;
  }
}

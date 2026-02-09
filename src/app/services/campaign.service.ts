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
  // private baseUrl = `${environment.apiBaseUrl}/campaign`; //old again
  private baseUrl = environment.apiBaseUrl + '/campaign'; //new

  constructor(private http: HttpClient, private authService: AuthService) {}
//old again
  // createCampaign(campaign: Campaign): Observable<Campaign> {
  //   return this.http.post<Campaign>(`${this.baseUrl}/create`, campaign);
  // }

  // updateCampaign(campaign: Campaign): Observable<Campaign> {
  //   return this.http.put<Campaign>(`${this.baseUrl}/update`, campaign);
  // }
  //old again

  private async getHeaders() {
    const token = await this.authService.getAccessToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      }),
      withCredentials: true // important for subdomain cookies
    };
  }

//new
  // createCampaign(campaign: Campaign) {
  //   return this.http.post<Campaign>(`${this.baseUrl}/create`, campaign, { withCredentials: true } );
  // }

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

  //new

  //new
  // getCampaignBySubdomain(subdomain: string) {
  //   return this.http.get<Campaign>(`${this.baseUrl}/by-subdomain/${subdomain}`, { withCredentials: true } );
  // }
  //new

 //old
// getCampaignBySubdomain(subdomain: string) {
//   return this.http.get<Campaign>(`/api/campaign/by-subdomain/${subdomain}`)
//     .toPromise()
//     .catch(err => {
//       console.warn('Failed to load campaign (anonymous or error)', err);
//       return null; // fallback to show "campaign not found" page
//     });
// }
//old



//old again
// getCampaignBySubdomain(subdomain: string) {
//   return this.http.get<Campaign>(
//   `${environment.apiBaseUrl}/campaign/by-subdomain/${subdomain}`
// )
//     .toPromise()
//     .catch(err => {
//       console.warn('Failed to load campaign (anonymous or error)', err);
//       return null;
//     });
// }

//old again

}

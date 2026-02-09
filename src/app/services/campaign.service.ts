import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Campaign } from '../../models/campaign.model';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  // private baseUrl = `${environment.apiBaseUrl}/campaign`; //old again
  private baseUrl = environment.apiBaseUrl + '/campaign'; //new

  constructor(private http: HttpClient) {}
//old again
  // createCampaign(campaign: Campaign): Observable<Campaign> {
  //   return this.http.post<Campaign>(`${this.baseUrl}/create`, campaign);
  // }

  // updateCampaign(campaign: Campaign): Observable<Campaign> {
  //   return this.http.put<Campaign>(`${this.baseUrl}/update`, campaign);
  // }
  //old again
//new
  createCampaign(campaign: Campaign) {
    return this.http.post<Campaign>(`${this.baseUrl}/create`, campaign, { withCredentials: true } );
  }

  updateCampaign(campaign: Campaign) {
    console.log('API Base URL:', environment.apiBaseUrl);
    return this.http.put<Campaign>(`${this.baseUrl}/update`, campaign, { withCredentials: true } );
  }
  //new

  //new
  getCampaignBySubdomain(subdomain: string) {
    return this.http.get<Campaign>(`${this.baseUrl}/by-subdomain/${subdomain}`, { withCredentials: true } );
  }
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

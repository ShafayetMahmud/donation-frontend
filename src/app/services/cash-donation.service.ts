import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import {
  CashDonationResponse,
  CreateCashDonationDto,
  UpdateCashDonationDto
} from '../../models/cash-donation.model';

@Injectable({
  providedIn: 'root'
})
export class CashDonationService {

  private baseUrl = environment.apiBaseUrl + '/cash-donations';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private async getHeaders() {
    const token = await this.authService.getAccessToken();

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      }),
      withCredentials: true
    };
  }

  async create(dto: CreateCashDonationDto): Promise<CashDonationResponse> {
    const options = await this.getHeaders();

    const response = await this.http
      .post<CashDonationResponse>(this.baseUrl, dto, options)
      .toPromise();

    if (!response) throw new Error('No response from API');
    return response;
  }

  async getByCampaign(campaignId: string): Promise<CashDonationResponse[]> {
    const options = await this.getHeaders();

    const response = await this.http
      .get<CashDonationResponse[]>(`${this.baseUrl}/campaign/${campaignId}`, options)
      .toPromise();

    if (!response) throw new Error('No response from API');
    return response;
  }

  // async update(id: string, dto: UpdateCashDonationDto): Promise<void> {
  //   const options = await this.getHeaders();

  //   await this.http
  //     .put(`${this.baseUrl}/${id}`, dto, options)
  //     .toPromise();
  // }

  async update(id: string, dto: UpdateCashDonationDto): Promise<CashDonationResponse> {
    const options = await this.getHeaders();

    const result = await firstValueFrom(
      this.http.put<CashDonationResponse>(`${this.baseUrl}/${id}`, dto, options)
    );

    if (!result) {
      throw new Error('Failed to update donation');
    }

    return result;
  }


  async delete(id: string): Promise<void> {
    const options = await this.getHeaders();

    await this.http
      .delete(`${this.baseUrl}/${id}`, options)
      .toPromise();
  }

  async getById(id: string): Promise<CashDonationResponse> {
    const token = await this.authService.getAccessToken(); // if needed
    const options = {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    };

    const response = await this.http
      .get<CashDonationResponse>(`${this.baseUrl}/${id}`, options)
      .toPromise();

    if (!response) {
      throw new Error(`Cash donation with id ${id} not found`);
    }

    return response;
  }


}

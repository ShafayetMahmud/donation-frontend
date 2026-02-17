import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CashDonationResponse,
  CreateCashDonationDto,
  UpdateCashDonationDto
} from '../../models/cash-donation.model';

@Injectable({
  providedIn: 'root'
})
export class CashDonationService {

  private baseUrl = '/api/cash-donations';

  constructor(private http: HttpClient) {}

  create(dto: CreateCashDonationDto): Observable<CashDonationResponse> {
    return this.http.post<CashDonationResponse>(this.baseUrl, dto);
  }

  getByCampaign(campaignId: string): Observable<CashDonationResponse[]> {
    return this.http.get<CashDonationResponse[]>(`${this.baseUrl}/campaign/${campaignId}`);
  }

  update(id: string, dto: UpdateCashDonationDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

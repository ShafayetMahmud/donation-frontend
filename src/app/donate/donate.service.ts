import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';

export interface DonationPayload {
  walletType: string;
  amount: number;
  senderPhone: string;
}

@Injectable({
  providedIn: 'root'
})
export class DonateService {
  constructor(private http: HttpClient) {}

  createDonation(payload: DonationPayload): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.donate.wallet, payload);
  }

  getDonationHistory(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.donate.history);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  private readonly baseUrl = `${environment.apiBaseUrl}/receipt`;

  constructor(private http: HttpClient) {}

  uploadReceipt(campaignId: string, donationId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post<any>(
    `${environment.apiBaseUrl}/gallery/receipt/${campaignId}/${donationId}/upload`,
    formData
  );
}


}

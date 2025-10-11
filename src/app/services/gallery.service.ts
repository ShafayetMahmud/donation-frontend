import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private readonly baseUrl = `${environment.apiBaseUrl}/gallery`;

  constructor(private http: HttpClient) {}

  getGalleryImages(subdomain: string | null): Observable<string[]> {
    const url = subdomain ? `${this.baseUrl}/${subdomain}` : `${this.baseUrl}/list-blobs`;
    return this.http.get<string[]>(url);
  }

  uploadImage(subdomain: string | null, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const url = subdomain ? `${this.baseUrl}/${subdomain}/upload` : `${this.baseUrl}/upload`;
    return this.http.post(url, formData);
  }
}
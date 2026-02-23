import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Campaign } from '../../models/campaign.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private baseUrl = environment.apiBaseUrl + '/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private async getHeaders() {
    const token = await this.authService.getAccessToken();
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      withCredentials: true
    };
  }

  async getAll(): Promise<any[]> {
    const options = await this.getHeaders();
    const response = await this.http.get<any[]>(this.baseUrl, options).toPromise();
    if (!response) throw new Error('No users found');
    return response;
  }

  async getById(id: string): Promise<any> {
    const options = await this.getHeaders();
    const response = await this.http.get<any>(`${this.baseUrl}/${id}`, options).toPromise();
    if (!response) throw new Error(`User ${id} not found`);
    return response;
  }
}
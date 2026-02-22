import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface UserDto {
  userId: string;
  email: string;
  name: string;
  globalRole: string;
  campaignRoles: { campaignId: string; campaignName: string; role: string }[];
}

export interface AssignRoleDto {
  userId: string;
  roleName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private baseUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private async getHeaders() {
    const token = await this.auth.getAccessToken();
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }), withCredentials: true };
  }

  async assignRole(campaignId: string, dto: AssignRoleDto): Promise<UserDto> {
    const options = await this.getHeaders();
    const response = await firstValueFrom(
      this.http.post<UserDto>(`${this.baseUrl}/${campaignId}/assign-role`, dto, options)
    );
    return response;
  }

  // Optional: Fetch all users (if you implement a GET API)
  async getAllUsers(): Promise<UserDto[]> {
    const options = await this.getHeaders();
    const response = await firstValueFrom(this.http.get<UserDto[]>(`${this.baseUrl}`, options));
    return response;
  }
}
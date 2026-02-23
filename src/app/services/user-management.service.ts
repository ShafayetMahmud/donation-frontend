import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { CampaignService } from './campaign.service';

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

  constructor(private http: HttpClient, private auth: AuthService) { }

  private async getHeaders() {
    const token = await this.auth.getAccessToken();
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }), withCredentials: true };
  }

  // Keep original signature: campaignId + DTO
  async assignRole(campaignId: string, dto: AssignRoleDto): Promise<UserDto> {
    const options = await this.getHeaders();
    const response = await firstValueFrom(
      this.http.post<UserDto>(`${this.baseUrl}/${campaignId}/assign-role`, dto, options)
    );
    return response;
  }

  async getAllUsers(): Promise<UserDto[]> {
    const options = await this.getHeaders();
    return await firstValueFrom(this.http.get<UserDto[]>(`${this.baseUrl}`, options));
  }

}
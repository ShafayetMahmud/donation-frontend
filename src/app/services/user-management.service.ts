import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { CampaignService } from './campaign.service';

export interface UserDto {
  // userId: number;
  id: string;
  email: string;
  displayName: string;
  globalRole: string;
  campaignRoles: { campaignId: string; campaignName: string; role: string }[];
}

export interface AssignRoleDto {
  id: number;
  roleName: string;
}

export interface RemoveRoleDto {
  id: number;
  roleName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private baseUrl = `${environment.apiBaseUrl}/campaign`; // ← use /campaign

  constructor(private http: HttpClient, private auth: AuthService) { }

  private async getHeaders() {
    const token = await this.auth.getAccessToken();
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }), withCredentials: true };
  }

  /** Assign role */
  async assignRole(campaignId: string, dto: AssignRoleDto): Promise<UserDto> {
    const options = await this.getHeaders();
    const response = await firstValueFrom(
      this.http.post<UserDto>(`${this.baseUrl}/${campaignId}/assign-role`, dto, options)
    );
    return response;
  }

  /** Remove role */
  async removeRole(campaignId: string, dto: RemoveRoleDto): Promise<UserDto> {
    const options = await this.getHeaders();
    const response = await firstValueFrom(
      this.http.post<UserDto>(`${this.baseUrl}/${campaignId}/remove-role`, dto, options)
    );
    return response;
  }

  /** Get all users */
  async getAllUsers(): Promise<UserDto[]> {
    const options = await this.getHeaders();
    return await firstValueFrom(this.http.get<UserDto[]>(`${environment.apiBaseUrl}/users`, options));
  }
}
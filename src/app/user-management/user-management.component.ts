import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserManagementService, UserDto, AssignRoleDto } from '../services/user-management.service';
import { CampaignService } from '../services/campaign.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  name: string;
  email: string;
  globalRole?: string;
  campaignRoles: { campaignId: string; campaignName: string; role: string }[];
  selectedRole?: string;
  selectedCampaign?: string;
}

interface Campaign {
  id: string;
  name: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  imports: [CommonModule, FormsModule],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  campaigns: Campaign[] = [];
  roles = ['CampaignOwner', 'CampaignManager', 'Donor']; // Extend as needed
  loading = false;

  constructor(
    private authService: AuthService,
    private userService: UserManagementService,
    private campaignService: CampaignService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadCampaigns();
  }

  /** Transform UserDto -> User */
  private mapDtoToUser(dto: UserDto): User {
    return {
      id: dto.userId,
      name: dto.name,
      email: dto.email,
      globalRole: dto.globalRole,
      campaignRoles: dto.campaignRoles?.map(r => ({
        campaignId: r.campaignId,
        campaignName: r.campaignName,
        role: r.role
      })) || []
    };
  }

  /** Load all users */
  async loadUsers() {
    this.loading = true;
    try {
      const dtos = await this.userService.getAllUsers();
      this.users = dtos.map(this.mapDtoToUser);
    } catch (err) {
      console.error('Error loading users:', err);
      alert('Failed to load users');
      this.users = [];
    } finally {
      this.loading = false;
    }
  }

  /** Load all campaigns */
  async loadCampaigns() {
    try {
      this.campaigns = await this.campaignService.getAll();
    } catch (err) {
      console.error('Error loading campaigns:', err);
      alert('Failed to load campaigns');
      this.campaigns = [];
    }
  }

  /** Assign role to user */
  async assignRole(user: User) {
    if (!user.selectedRole || !user.selectedCampaign) {
      alert('Please select both campaign and role');
      return;
    }

    const dto: AssignRoleDto = {
      userId: user.id,
      roleName: user.selectedRole
    };

    try {
      const updatedDto = await this.userService.assignRole(user.selectedCampaign!, dto);
      const index = this.users.findIndex(u => u.id === updatedDto.userId);
      if (index !== -1) this.users[index] = this.mapDtoToUser(updatedDto);
      alert('Role assigned successfully');
    } catch (err: any) {
      console.error('Error assigning role:', err);
      alert(err.error?.message || 'Error assigning role');
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserManagementService, UserDto, AssignRoleDto } from '../services/user-management.service';
import { CampaignService } from '../services/campaign.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

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
  imports: [CommonModule, FormsModule, MatIconModule],
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
  ) { }

  async ngOnInit() {
    try {
      await this.authService.initialize(); // ensure MSAL ready
      await this.loadUsers();
      await this.loadCampaigns();
    } catch (err) {
      console.error('Auth initialization failed', err);
    }
  }

  /** Transform UserDto -> User */
  // private mapDtoToUser(dto: UserDto): User {
  //   return {
  //     id: dto.userId != null ? dto.userId.toString() : '', // safe conversion
  //     name: (dto as any).displayName || dto.name,
  //     email: dto.email,
  //     globalRole: dto.globalRole,
  //     campaignRoles: dto.campaignRoles?.map(r => ({
  //       campaignId: r.campaignId,
  //       campaignName: r.campaignName,
  //       role: r.role
  //     })) || []
  //   };
  // }

  private mapDtoToUser(dto: UserDto): User {
  return {
    id: dto.userId != null ? dto.userId.toString() : '', // safe conversion
    name: (dto as any).displayName || dto.name || 'Unknown',
    email: dto.email || '',
    globalRole: dto.globalRole,
    campaignRoles: (dto.campaignRoles || []).map(r => ({
      campaignId: r.campaignId?.toString() || '',
      campaignName: r.campaignName || '',
      role: r.role || ''
    }))
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
      userId: parseInt(user.id, 10),  // <-- ensure integer
      roleName: user.selectedRole
    };

    try {
      const updatedDto = await this.userService.assignRole(user.selectedCampaign!, dto);
      const index = this.users.findIndex(u => u.id === updatedDto.userId.toString());
      if (index !== -1) this.users[index] = this.mapDtoToUser(updatedDto);
      alert('Role assigned successfully');
    } catch (err: any) {
      console.error('Error assigning role:', err);
      alert(err.error?.message || 'Error assigning role');
    }
  }
  //important build test

  // Add a helper to get available roles per user and selected campaign
  getAvailableRoles(user: User): string[] {
    if (!user.selectedCampaign) return this.roles; // no campaign selected, show all

    // roles already assigned to this campaign
    const assignedRoles = user.campaignRoles
      .filter(r => r.campaignId === user.selectedCampaign)
      .map(r => r.role);

    // return only roles not yet assigned
    return this.roles.filter(role => !assignedRoles.includes(role));
  }

  async removeRole(user: User, roleToRemove: { campaignId: string; role: string }) {
    if (!confirm(`Are you sure you want to remove ${roleToRemove.role} from ${user.name} for this campaign?`)) {
      return;
    }

    try {
      // Call the service to remove role
      await this.userService.removeRole(roleToRemove.campaignId, {
        userId: parseInt(user.id, 10),
        roleName: roleToRemove.role
      });

      // Update local user data
      user.campaignRoles = user.campaignRoles.filter(
        r => !(r.campaignId === roleToRemove.campaignId && r.role === roleToRemove.role)
      );

      alert('Role removed successfully');
    } catch (err: any) {
      console.error('Error removing role:', err);
      alert(err.error?.message || 'Error removing role');
    }
  }
}
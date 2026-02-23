import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  name: string;
  email: string;
  campaignRoles: { campaignId: string, campaignName: string, role: string }[];
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
  imports: [
    CommonModule,
    FormsModule
  ],
})
export class UserManagementComponent implements OnInit {

  users: User[] = [];
  campaigns: Campaign[] = [];
  roles = ['CampaignOwner', 'CampaignManager', 'Donor']; // Extend as needed
  loading = false;

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.loadUsers();
    this.loadCampaigns();
  }

  loadUsers() {
    this.loading = true;
    this.http.get<User[]>('/api/users')
      .subscribe(users => {
        this.users = users;
        this.loading = false;
      });
  }

  loadCampaigns() {
    this.http.get<Campaign[]>('/api/campaign')
      .subscribe(campaigns => this.campaigns = campaigns);
  }

  assignRole(user: User) {
    if (!user.selectedRole || !user.selectedCampaign) {
      alert('Please select both campaign and role');
      return;
    }

    this.http.post(`/api/campaign/${user.selectedCampaign}/assign-role`, {
      userId: user.id,
      roleName: user.selectedRole
    }).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.loadUsers(); // Refresh the user list
      },
      error: err => alert(err.error || 'Error assigning role')
    });
  }
}
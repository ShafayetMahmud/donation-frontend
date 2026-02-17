import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashDonationService } from '../services/cash-donation.service';
import { SubdomainService } from '../services/subdomain.service';
import { CashDonationResponse, ApprovalStatus } from '../../models/cash-donation.model';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-cash-donation-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cash-donation-overview.component.html'
})
export class CashDonationOverviewComponent implements OnInit {

  donations: CashDonationResponse[] = [];
  isLoading = true;

  // Progress
  targetAmount = 10000000; // static for now
  totalCollected = 0;

  approvalStatusEnum = ApprovalStatus;

  constructor(
    private donationService: CashDonationService,
    private subdomainService: SubdomainService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    const campaign = this.subdomainService.getCurrentCampaign();
    if (!campaign) return;

    try {
      this.donations = await this.donationService.getByCampaign(campaign.id);
      this.totalCollected = this.donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    } catch (err) {
      console.error('Failed to load donations', err);
      this.donations = [];
    } finally {
      this.isLoading = false;
    }
  }

  get progressPercent() {
    return (this.totalCollected / this.targetAmount) * 100;
  }

  goToCreate() {
        this.router.navigate(['/cash-donation/create']);
    }

  editDonation(donation: CashDonationResponse) {
    this.router.navigate(['/cash-donation/edit', donation.id]);
  }

  async deleteDonation(donation: CashDonationResponse) {
    if (!confirm('Are you sure you want to delete this donation?')) return;

    try {
      await this.donationService.delete(donation.id);
      this.donations = this.donations.filter(d => d.id !== donation.id);
      this.totalCollected = this.donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    } catch (err) {
      console.error('Failed to delete donation', err);
      alert('Failed to delete donation.');
    }
  }
}

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
import { Chart } from 'chart.js/auto';

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
  templateUrl: './cash-donation-overview.component.html',
  styleUrls: ['./cash-donation-overview.component.css']
})
export class CashDonationOverviewComponent implements OnInit {

  donations: CashDonationResponse[] = [];
  displayedColumns = ['donor', 'amount', 'date', 'approval', 'actions'];
  isLoading = true;

  private chart: Chart | null = null;

  // Progress
  targetAmount = 10000000; // static for now
  totalCollected = 0;

  approvalStatusEnum = ApprovalStatus;

  constructor(
    private donationService: CashDonationService,
    private subdomainService: SubdomainService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.isLoading = true;

    const campaign = this.subdomainService.getCurrentCampaign();
    if (!campaign) {
      this.isLoading = false;
      return;
    }

    try {
      this.donations = await this.donationService.getByCampaign(campaign.id);
      this.totalCollected = this.donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    } catch (err) {
      console.error('Failed to load donations', err);
      this.donations = [];
    } finally {
      this.isLoading = false;
      setTimeout(() => this.buildChart());
    }
  }

  getStatusClass(status: number) {
    if (status === 1) return 'status-approved';
    if (status === 2) return 'status-rejected';
    return 'status-pending';
  }

  buildChart() {

    // Destroy previous chart if exists
    if (this.chart) {
      this.chart.destroy();
    }

    const approved = this.donations
      .filter(d => d.approvalStatus === 1)
      .reduce((s, d) => s + d.amount, 0);

    const pending = this.donations
      .filter(d => d.approvalStatus === 0)
      .reduce((s, d) => s + d.amount, 0);

    this.chart = new Chart('donationChart', {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Pending'],
        datasets: [{
          data: [approved, pending]
        }]
      }
    });
  }



  get progressPercent() {
    if (!this.targetAmount) return 0;
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

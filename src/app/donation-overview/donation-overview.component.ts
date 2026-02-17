import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashDonationService } from '../services/cash-donation.service';
import { SubdomainService } from '../services/subdomain.service';
import { CashDonationResponse, ApprovalStatus } from '../../models/cash-donation.model';

@Component({
  selector: 'app-donation-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donation-overview.component.html'
})
export class DonationOverviewComponent implements OnInit {

  isLoading = true;
  donations: CashDonationResponse[] = [];

  targetAmount = 10000000; // static for now
  totalCollected = 0;

  approvalStatusEnum = ApprovalStatus; // add this

  constructor(
    private donationService: CashDonationService,
    private subdomainService: SubdomainService
  ) {}

  async ngOnInit() {
    const campaign = this.subdomainService.getCurrentCampaign();
    if (!campaign) return;

    this.isLoading = true;

    const res = await this.donationService.getByCampaign(campaign.id);
    this.donations = res;
    this.totalCollected = res.reduce((sum, d) => sum + (d.amount || 0), 0);

    this.isLoading = false;
  }

  get progressPercent() {
    return (this.totalCollected / this.targetAmount) * 100;
  }

  // Helper to get status text
  getStatusText(status: ApprovalStatus) {
    switch (status) {
      case ApprovalStatus.Pending: return 'Pending';
      case ApprovalStatus.Approved: return 'Approved';
      case ApprovalStatus.Rejected: return 'Rejected';
      default: return 'Unknown';
    }
  }

}

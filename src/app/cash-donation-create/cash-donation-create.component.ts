import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CashDonationService } from '../services/cash-donation.service';
import { SubdomainService } from '../services/subdomain.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-cash-donation-create',
  standalone: true,
  imports: [
  CommonModule,
  ReactiveFormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatSlideToggleModule,
  MatButtonModule,
  MatDividerModule
],
  templateUrl: './cash-donation-create.component.html'
})
export class CashDonationCreateComponent {

  form;

  constructor(
    private fb: FormBuilder,
    private donationService: CashDonationService,
    private subdomainService: SubdomainService,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullName: [''],
      phone: [''],
      email: [''],
      address: [''],
      isAnonymous: [false],
      amount: [null, Validators.required],
      currency: ['BDT'],
      notes: ['']
    });
  }

  async submit() {
  if (this.form.invalid) return;

  const campaign = this.subdomainService.getCurrentCampaign();
  if (!campaign) return;

  await this.donationService.create({
    ...this.form.value,
    campaignId: campaign.id
  } as any);

  this.router.navigate(['/overview']);
}

}


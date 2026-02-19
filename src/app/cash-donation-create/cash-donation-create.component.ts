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
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { ReceiptService } from '../services/receipt.service';

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
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: './cash-donation-create.component.html',
  styleUrls: ['./cash-donation-create.component.css']
})
export class CashDonationCreateComponent {

  selectedReceipt?: File;
  receiptPreview?: string;
  isSubmitting = false;



  form;

  constructor(
    private fb: FormBuilder,
    private donationService: CashDonationService,
    private subdomainService: SubdomainService,
    private router: Router,
    private receiptService: ReceiptService
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

  async onReceiptSelected(event: any) {

    const file: File = event.target.files[0];
    if (!file) return;

    this.selectedReceipt = file;

    // preview
    const reader = new FileReader();
    reader.onload = () => {
      this.receiptPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }


  async submit() {
  if (this.form.invalid || this.isSubmitting) return;

  this.isSubmitting = true;

  try {
    const campaign = this.subdomainService.getCurrentCampaign();
    if (!campaign) return;

    const formValue = this.form.value;

    const donation = await this.donationService.create({
      campaignId: campaign.id,
      fullName: formValue.fullName ?? undefined,
      phone: formValue.phone ?? undefined,
      email: formValue.email ?? undefined,
      address: formValue.address ?? undefined,
      isAnonymous: formValue.isAnonymous ?? false,
      amount: formValue.amount!,
      currency: formValue.currency ?? 'BDT',
      notes: formValue.notes ?? undefined
    });

    if (this.selectedReceipt) {
      await this.receiptService
        .uploadReceipt(campaign.id, donation.id, this.selectedReceipt)
        .toPromise();
    }

    this.router.navigate(['/cash-donation']);

  } catch (err) {
    console.error(err);
  } finally {
    this.isSubmitting = false;
  }
}


}


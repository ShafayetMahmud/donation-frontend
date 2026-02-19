import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CashDonationService } from '../services/cash-donation.service';
import { SubdomainService } from '../services/subdomain.service';
import { Router } from '@angular/router';
import { ReceiptService } from '../services/receipt.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

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
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: './cash-donation-create.component.html',
  styleUrls: ['./cash-donation-create.component.css']
})
export class CashDonationCreateComponent {

  @ViewChild('receiptInput') receiptInput!: ElementRef<HTMLInputElement>;

  form;
  selectedReceipt?: File;
  receiptPreview?: string;
  isSubmitting = false;

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

  triggerReceiptUpload() {
    this.receiptInput.nativeElement.click();
  }

  async onReceiptSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.selectedReceipt = file;

    // show preview locally
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

      // Step 1: Create donation
      let donation = await this.donationService.create({
        campaignId: campaign.id,
        fullName: formValue.fullName ?? undefined,
        phone: formValue.phone ?? undefined,
        email: formValue.email ?? undefined,
        address: formValue.address ?? undefined,
        isAnonymous: formValue.isAnonymous ?? false,
        amount: formValue.amount!,
        currency: formValue.currency ?? 'BDT',
        notes: formValue.notes ?? undefined,
        receiptImageUrl: undefined,  // initially null
        receiptNumber: undefined
      });

      // Step 2: If a receipt is selected, upload it and immediately update donation
      if (this.selectedReceipt) {
        const result: any = await this.receiptService
          .uploadReceipt(campaign.id, donation.id, this.selectedReceipt)
          .toPromise();

        // update donation with uploaded receipt
        // donation = await this.donationService.update(donation.id, {
        //   receiptImageUrl: result.url,
        //   receiptNumber: result.receiptNumber ?? undefined
        // });
        const updatedDonation = await this.donationService.update(donation.id, {
          receiptImageUrl: result.url,
          receiptNumber: result.receiptNumber ?? undefined
        });

        if (!updatedDonation) {
          throw new Error('Failed to update donation');
        }

        donation = updatedDonation;

      }

      // Step 3: Navigate to edit or listing page
      this.router.navigate(['/cash-donation']);

    } catch (err) {
      console.error(err);
    } finally {
      this.isSubmitting = false;
    }
  }
}

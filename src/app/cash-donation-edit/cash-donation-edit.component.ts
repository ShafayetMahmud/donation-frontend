import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CashDonationService } from '../services/cash-donation.service';
import { ReceiptService } from '../services/receipt.service';
import { ApprovalStatus } from '../../models/cash-donation.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

import { CashDonationResponse, UpdateCashDonationDto } from '../../models/cash-donation.model';

@Component({
  selector: 'app-cash-donation-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './cash-donation-edit.component.html',
  styleUrls: ['./cash-donation-edit.component.css']
})
export class CashDonationEditComponent implements OnInit {
  donation!: CashDonationResponse;
  isLoading = true;
  isSubmitting = false;
  approvalStatusEnum = ApprovalStatus;

  form: any;
  selectedReceipt?: File;
  receiptPreview?: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private donationService: CashDonationService,
    private receiptService: ReceiptService
  ) {
    this.form = this.fb.group({
      fullName: [{ value: '', disabled: true }],
      phone: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
      isAnonymous: [{ value: false, disabled: true }],
      amount: [null, Validators.required],
      currency: ['BDT', Validators.required],
      notes: [''],
      approvalStatus: [ApprovalStatus.Pending, Validators.required]
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isLoading = true;

    this.donation = await this.donationService.getById(id);

    this.form.patchValue({
      fullName: this.donation.donor.fullName ?? '',
      phone: this.donation.donor.phone ?? '',
      email: this.donation.donor.email ?? '',
      address: '',
      isAnonymous: this.donation.donor.isAnonymous ?? false,
      amount: this.donation.amount ?? 0,
      currency: this.donation.currency ?? 'BDT',
      notes: this.donation.notes ?? '',
      approvalStatus: this.donation.approvalStatus ?? ApprovalStatus.Pending
    });

    // Preload existing receipt
    this.receiptPreview = this.donation.receiptImageUrl ?? undefined;

    this.isLoading = false;
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
      const dto: UpdateCashDonationDto = {
        amount: this.form.value.amount,
        currency: this.form.value.currency,
        notes: this.form.value.notes,
        approvalStatus: Number(this.form.value.approvalStatus)
      };

      // update donation
      await this.donationService.update(this.donation.id, dto);

      // upload receipt if selected
      if (this.selectedReceipt) {
        await this.receiptService
          .uploadReceipt(this.donation.campaignId, this.donation.id, this.selectedReceipt)
          .toPromise();
      }

      this.router.navigate(['/cash-donation']);
    } finally {
      this.isSubmitting = false;
    }
  }
}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CashDonationService } from '../services/cash-donation.service';
import { ReceiptService } from '../services/receipt.service';
import { ApprovalStatus, CashDonationResponse, UpdateCashDonationDto } from '../../models/cash-donation.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../services/auth.service';

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

  @ViewChild('receiptInput') receiptInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private donationService: CashDonationService,
    private receiptService: ReceiptService,
    public authService: AuthService,
  ) {
    this.form = this.fb.group({
      fullName: [{ value: '', disabled: true }],
      phone: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
      isAnonymous: [{ value: false, disabled: true }],
      amount: [0, Validators.required],
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

    const user = this.authService.currentUser;

  // donors cannot change approvalStatus
  if (user?.role === 'Donor') {
    this.form.get('approvalStatus')?.disable();
  }

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

    // preload existing receipt
    this.receiptPreview = this.donation.receiptImageUrl ?? undefined;
    this.isLoading = false;
  }

  triggerReceiptUpload() {
    this.receiptInput.nativeElement.click();
  }

  async onReceiptSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.donation) return;

    this.selectedReceipt = file;

    // preview locally
    const reader = new FileReader();
    reader.onload = () => {
      this.receiptPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    // immediately upload
    const campaignId = this.donation.campaignId;
    const result: any = await this.receiptService.uploadReceipt(campaignId, this.donation.id, file).toPromise();
    this.donation.receiptImageUrl = result.url;
  }

  async removeReceipt() {
    this.receiptPreview = undefined;
    this.selectedReceipt = undefined;
    if (this.donation) this.donation.receiptImageUrl = undefined;
    // optionally, call backend to delete the receipt file if needed
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

      await this.donationService.update(this.donation.id, dto);
      this.router.navigate(['/cash-donation']);
    } finally {
      this.isSubmitting = false;
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CashDonationService } from '../services/cash-donation.service';
import { ApprovalStatus } from '../../models/cash-donation.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import {
    CashDonationResponse,
    CreateCashDonationDto,
    UpdateCashDonationDto
} from '../../models/cash-donation.model';

@Component({
    selector: 'app-cash-donation-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatButtonModule],
    templateUrl: './cash-donation-edit.component.html',
})
export class CashDonationEditComponent implements OnInit {
    donation!: CashDonationResponse;

    isLoading = true;

    approvalStatusEnum = ApprovalStatus;

    form = null as any; // temporary placeholder

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private donationService: CashDonationService
    ) {
        this.form = this.fb.group({
            fullName: ['', Validators.required],
            phone: [''],
            email: [''],
            address: [''],
            isAnonymous: [false],
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
            address: '', // optional
            isAnonymous: this.donation.donor.isAnonymous ?? false,
            amount: this.donation.amount ?? 0,
            currency: this.donation.currency ?? 'BDT',
            notes: this.donation.notes ?? '',
            approvalStatus: this.donation.approvalStatus ?? ApprovalStatus.Pending
        });

        this.isLoading = false;
    }

    async submit() {
        if (this.form.invalid) return;

        const dto: UpdateCashDonationDto = {
            ...this.form.value,
            approvalStatus: this.form.value.approvalStatus ?? undefined
        };

        await this.donationService.update(this.donation.id, dto);
        this.router.navigate(['/overview']);
    }
}

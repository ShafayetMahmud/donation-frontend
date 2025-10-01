import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';
import { DonateService, DonationPayload } from './donate.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('160ms ease-in', style({ opacity: 0, transform: 'translateY(-6px)' }))
      ])
    ])
  ]
})
export class DonateComponent {
  amount = 0;
  senderPhone = '';
  selectedMethod: string | null = null;
  selectedWallet: string | null = null;
  showForm = false;
  showConfirmation = false;
  loading = false;

  constructor(private donateService: DonateService, private router: Router) { }

  proceed() {
    // Show Step 2 if a wallet is selected
    if (['bkash', 'nagad', 'rocket'].includes(this.selectedMethod!)) {
      this.showForm = true;
    } else if (this.selectedMethod === 'cod') {
      alert('Cash on Delivery selected. Implement flow later.');
    } else if (this.selectedMethod === 'card') {
      alert('Card payment selected. Implement flow later.');
    }
  }

  goBack() {
    this.showForm = false;
    this.selectedWallet = null; // optional: reset wallet selection
  }




  onSubmit() {
    if (!this.amount || !this.senderPhone) return;
    this.loading = true;

    const payload: DonationPayload = {
      walletType: this.selectedWallet || '',
      amount: Number(this.amount),
      senderPhone: this.senderPhone
    };

    this.donateService.createDonation(payload).subscribe({
      next: () => {
        setTimeout(() => {
          this.loading = false;
          this.showConfirmation = true;
          this.showForm = false;
        }, 600);
      },
      error: () => {
        this.loading = false;
        alert('Payment failed. Try again.');
      }
    });
  }

  reset() {
    this.amount = 0;
    this.senderPhone = '';
    this.selectedMethod = null;
    this.selectedWallet = null;
    this.showForm = false;
    this.showConfirmation = false;
  }

  close() {
    this.router.navigate(['/']);
  }
}


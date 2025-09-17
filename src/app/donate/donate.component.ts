import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';
import { DonateService, DonationPayload } from './donate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  showConfirmation = false;
  loading = false;

  constructor(private donateService: DonateService, private router: Router) {}

  onSubmit() {
    if (!this.amount || !this.senderPhone) return;

    this.loading = true;

    const payload: DonationPayload = {
      walletType: 'bkash',
      amount: Number(this.amount),
      senderPhone: this.senderPhone
    };

    this.donateService.createDonation(payload).subscribe({
      next: (res) => {
        console.log('Payment create response:', res);
        setTimeout(() => {
          this.loading = false;
          this.showConfirmation = true;
        }, 600);
      },
      error: (err) => {
        console.error('Payment error', err);
        this.loading = false;
        alert('Payment failed. Try again.');
      }
    });
  }

  reset() {
    this.amount = 0;
    this.senderPhone = '';
    this.showConfirmation = false;
  }

  goToHomePage() {
    this.router.navigate(['/']);
  }

  close() {
    this.goToHomePage();
  }

  fillSample() {
    this.amount = 500;
    this.senderPhone = '01712345678';
  }
}

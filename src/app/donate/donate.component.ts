// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { HttpClientModule, HttpClient } from '@angular/common/http';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';

// @Component({
//   selector: 'app-donate',
//   templateUrl: './donate.component.html',
//   styleUrls: ['./donate.component.css'],
//   standalone: true,
//   imports: [FormsModule, HttpClientModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule]
// })
// export class DonateComponent {
//   walletType = 'bkash';
//   amount: number = 0;
//   senderPhone: string = '';

//   constructor(private http: HttpClient) {}

//   donate() {
//     const payload = {
//       walletType: this.walletType,
//       amount: this.amount,
//       senderPhone: this.senderPhone
//     };

//     this.http.post('http://localhost:5126/api/donate/wallet', payload)
//       .subscribe({
//         next: res => console.log('Payment response:', res),
//         error: err => console.error(err)
//       });
//   }
// }


// src/app/donate/donate.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
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

  // replace with your backend endpoint
  private apiUrl = 'http://localhost:5126/api/donate/wallet';

  constructor(private http: HttpClient) {}

  onSubmit() {
    // basic guard
    if (!this.amount || !this.senderPhone) return;

    this.loading = true;

    const payload = {
      walletType: 'bkash',
      amount: Number(this.amount),
      senderPhone: this.senderPhone
    };

    // POST to your backend to create & return bKash payment creation data.
    // Backend should handle bKash server-to-server calls and return relevant status.
    this.http.post(this.apiUrl, payload).subscribe({
      next: (res: any) => {
        // If you need to open bKash SDK here, do it when the backend returns the createResponse.
        // For this UI flow we assume backend accepted the request and returns success status.
        console.log('Payment create response:', res);

        // small delay to let user perceive the processing
        setTimeout(() => {
          this.loading = false;
          this.showConfirmation = true;
        }, 600);
      },
      error: (err) => {
        console.error('Payment error', err);
        this.loading = false;
        // OPTIONAL: better error handling / toast
        alert('Payment failed. Try again.');
      }
    });
  }

  reset() {
    this.amount = 0;
    this.senderPhone = '';
    this.showConfirmation = false;
  }

  close() {
    // close behavior: same as reset for this one-page component
    this.reset();
  }

  // helper for quick testing
  fillSample() {
    this.amount = 500;
    this.senderPhone = '01712345678';
  }
}

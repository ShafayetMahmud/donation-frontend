// src/app/donate/donate.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class DonateComponent {
  walletType = 'bkash';
  amount: number = 0;
  senderPhone: string = '';

  constructor(private http: HttpClient) {}

  donate() {
    const payload = {
      walletType: this.walletType,
      amount: this.amount,
      senderPhone: this.senderPhone
    };

    this.http.post('http://localhost:5126/api/donate/wallet', payload)
      .subscribe({
        next: res => console.log('Payment response:', res),
        error: err => console.error(err)
      });
  }
}

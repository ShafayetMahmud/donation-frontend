// src/app/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  returnUrl: string | null = null;

  constructor(
    private msalService: MsalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
  this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

  this.msalService.handleRedirectObservable().subscribe({
    next: (result) => {
      if (result) {
        console.log('Logged in successfully', result);
      }
      // Redirect back
      if (this.returnUrl) {
        window.location.href = this.returnUrl;
      } else {
        window.location.href = '/';
      }
    },
    error: (error) => console.error('Login error', error)
  });

  // Start login
  this.msalService.loginRedirect(environment.loginRequest);
}

}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="login-container">
      <p>Redirecting… Please wait, logging you in</p>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  returnUrl: string | null = null;

  constructor(private msalService: MsalService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    this.msalService.instance.handleRedirectPromise().then((result) => {
      const accounts = this.msalService.instance.getAllAccounts();

      if (result !== null || accounts.length > 0) {
        // User is logged in → redirect
        window.location.href = this.returnUrl ?? '/';
      } else {
        // Not logged in → trigger MSAL redirect
        this.msalService.loginRedirect(environment.loginRequest);
      }
    }).catch(err => console.error('MSAL login error', err));
  }
}

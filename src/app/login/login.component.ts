import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [MsalService],
  template: `
    <div class="login-container">
      <p>Redirecting… Please wait, logging you in</p>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private msalService = inject(MsalService);
  private route = inject(ActivatedRoute);
  returnUrl: string | null = null;

  async ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    await this.msalService.instance.initialize();

    this.msalService.instance.handleRedirectPromise()
      .then(result => {
        const accounts = this.msalService.instance.getAllAccounts();
        if (result || accounts.length > 0) {
          // ✅ User is logged in → redirect back to original subdomain
          window.location.href = this.returnUrl ?? '/';
        } else {
          // Not logged in yet → trigger MSAL redirect login
          this.msalService.loginRedirect(environment.loginRequest);
        }
      })
      .catch(err => console.error('MSAL login error', err));
  }
}

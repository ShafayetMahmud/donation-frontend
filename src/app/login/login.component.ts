import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="login-container">
      <p>Checking login…</p>
    </div>
  `
})
export class LoginComponent implements OnInit {

  private msalService = inject(MsalService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  async ngOnInit() {

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

    const hostname = window.location.hostname;
    const isMainDomain = hostname === 'mudhammataan.com' || hostname === 'www.mudhammataan.com';

    await this.msalService.instance.initialize();

    // Process MSAL redirect if coming back from Microsoft login
    await this.msalService.instance.handleRedirectPromise();

    // ---------------- MAIN DOMAIN LOGIN ----------------
    if (isMainDomain) {

      const accounts = this.msalService.instance.getAllAccounts();

      if (accounts.length > 0) {
        // Already logged in → restore user & redirect
        await this.authService.restoreUserFromMsal();
        window.location.href = returnUrl;
        return;
      }

      // Not logged in → start MSAL login
      this.msalService.loginRedirect(environment.loginRequest);
      return;
    }

    // ---------------- SUBDOMAIN LOGIN ----------------
    const restored = await this.authService.restoreUserOnSubdomain();

    if (restored) {
      window.location.href = returnUrl;
      return;
    }

    // Still not logged in → send user to MAIN DOMAIN login
    const mainDomainLogin =
      `https://mudhammataan.com/login?returnUrl=${encodeURIComponent(window.location.href)}`;

    window.location.href = mainDomainLogin;
  }
}

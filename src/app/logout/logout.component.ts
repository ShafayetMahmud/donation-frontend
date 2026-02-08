import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  standalone: true,
  template: `<p>Logging out...</p>`
})
export class LogoutComponent implements OnInit {

  private msalService = inject(MsalService);
  private route = inject(ActivatedRoute);

  async ngOnInit() {

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    const safeReturnUrl = this.validateReturnUrl(returnUrl);

    await this.msalService.logoutRedirect({
      postLogoutRedirectUri: safeReturnUrl
    });
  }

  // ⭐ Prevent open redirect attacks
  private validateReturnUrl(url: string | null): string {

    if (!url) return window.location.origin;

    try {
      const parsed = new URL(url);

      if (parsed.hostname.endsWith('.mudhammataan.com') ||
          parsed.hostname === 'mudhammataan.com') {
        return url;
      }

    } catch {}

    return window.location.origin;
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  template: `<p>Logging out...</p>`
})
export class LogoutComponent implements OnInit {

  private msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);
  private route = inject(ActivatedRoute);

  async ngOnInit() {

    // ⭐ WAIT until MSAL is ready
    await firstValueFrom(
      this.msalBroadcastService.inProgress$.pipe(
        filter(status => status === InteractionStatus.None)
      )
    );

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const safeReturnUrl = this.validateReturnUrl(returnUrl);

    const alreadyLoggedOut =
      !this.msalService.instance.getAllAccounts().length;

    if (alreadyLoggedOut) {
      window.location.href = safeReturnUrl;
      return;
    }

    await this.msalService.logoutRedirect({
      postLogoutRedirectUri:
        `https://mudhammataan.com/logout?returnUrl=${encodeURIComponent(safeReturnUrl)}`
    });
  }

  private validateReturnUrl(url: string | null): string {

    if (!url) return window.location.origin;

    try {
      const parsed = new URL(url);

      if (
        parsed.hostname.endsWith('.mudhammataan.com') ||
        parsed.hostname === 'mudhammataan.com'
      ) {
        return url;
      }

    } catch {}

    return window.location.origin;
  }
}

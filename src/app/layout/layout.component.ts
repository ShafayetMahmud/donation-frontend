import { Component } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { SubdomainService } from '../services/subdomain.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { Campaign } from '../../models/campaign.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    AsyncPipe,
    TranslateModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  public campaign$: Observable<Campaign | null>;
  public user$: Observable<{ email: string; name: string; role: string } | null>;

  constructor(
    public langService: LanguageService,
    public subdomainService: SubdomainService,
    private router: Router,
    private authService: AuthService
  ) {
    this.campaign$ = this.subdomainService.campaign$;
    this.user$ = this.authService.user$;
  }

//   async onLogin() {
//   const result = await this.authService.loginPopup();
// }

// layout.component.ts
// onLogin() {
//   const returnUrl = encodeURIComponent(window.location.origin); // subdomain URL
//   window.location.href = `https://mudhammataan.com/login?returnUrl=${returnUrl}`;
// }

onLogin() {
  if (this.subdomainService.isSubdomain() && !this.subdomainService.isSpecialSubdomain()) {
    // Subdomain login → redirect to main domain login
    const returnUrl = encodeURIComponent(window.location.href); // return to this subdomain page
    window.location.href = `https://mudhammataan.com/login?returnUrl=${returnUrl}`;
  } else {
    // Main domain login → use popup (old behavior)
    this.authService.loginPopup()
      .then(result => console.log('Logged in successfully', result))
      .catch(error => console.error('Login error', error));
  }
}




  async onCreateCampaignClick() {
  this.router.navigate(['/create-campaign']);
}


  onEditCampaign() {
    // Get the latest campaign directly (not observable)
    const campaign = this.subdomainService.getCurrentCampaign();

    if (campaign) {
      // Navigate to the create/edit campaign page, passing state
      this.router.navigate(['/create-campaign'], { state: { campaign } });
    } else {
      console.warn('No campaign found to edit.');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

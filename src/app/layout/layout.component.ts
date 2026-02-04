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

  onLogin() {
    if (this.subdomainService.isSubdomain() && !this.subdomainService.isSpecialSubdomain()) {
      const returnUrl = encodeURIComponent(window.location.href); // current subdomain URL
      window.location.href = `https://mudhammataan.com/login?returnUrl=${returnUrl}`;
    } else {
      window.location.href = '/login';
    }
  }

  async onCreateCampaignClick() {
    this.router.navigate(['/create-campaign']);
  }


  onEditCampaign() {
    const campaign = this.subdomainService.getCurrentCampaign();
    if (campaign) {
      this.router.navigate(['/create-campaign'], { state: { campaign } });
    } else {
      console.warn('No campaign found to edit.');
    }
  }

//   get canEditCampaign(): boolean {
//   return (
//     this.subdomainService.isSubdomain() &&
//     !this.subdomainService.isSpecialSubdomain() &&
//     this.subdomainService.getCurrentCampaign() &&
//     this.authService.getCurrentUser()
//   );
// }

get canEditCampaign(): boolean {
  const user = this.authService.getCurrentUser();
  const campaign = this.subdomainService.getCurrentCampaign();

  return (
    this.subdomainService.isSubdomain() &&
    !this.subdomainService.isSpecialSubdomain() &&
    !!campaign &&
    !!user
  );
}



  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

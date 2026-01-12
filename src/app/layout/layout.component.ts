import { Component } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { SubdomainService, Campaign } from '../services/subdomain.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';

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

  async onLogin() {
  // 1️⃣ Trigger MSAL login popup
  const result = await this.authService.loginPopup();

  // 2️⃣ Exchange ID token with backend to get role
  // const resp: any = await this.authService.exchangeIdToken(result.idToken);

  // 3️⃣ Update user observable with email, name, and role
  // const user = {
  //   email: resp.email || result.account?.username || '',
  //   name: resp.name || result.account?.name || result.account?.username || '',
  //   role: resp.role || 'AppUser'
  // };

  // 4️⃣ Set current user in AuthService
  // this.authService.setCurrentUser(user);
}


  async onCreateCampaignClick() {
  // let user = await this.authService.getCurrentUser(); // Returns user or null
  // if (!user) {
  //   Trigger login popup
  //   const result = await this.authService.loginPopup();
    
  //   Exchange token with backend to get role
  //   const resp: any = await this.authService.exchangeIdToken(result.idToken);

  //   Update user observable with role
  //   user = {
  //     email: resp.email || result.account?.username || '',
  //     name: resp.name || result.account?.name || result.account?.username || '',
  //     role: resp.role || 'AppUser'
  //   };

  //   Set the user in AuthService
  //   this.authService.setCurrentUser(user); // We'll add this function next
  // }

  // Now navigate to create campaign
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

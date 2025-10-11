import { Component } from '@angular/core';
import { SubdomainService, Campaign } from '../services/subdomain.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    CommonModule,
    AsyncPipe
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  public campaign$: Observable<Campaign | null>;

  constructor(
    public subdomainService: SubdomainService,
    private router: Router
  ) {
    this.campaign$ = this.subdomainService.campaign$;
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
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../services/auth.interceptor';

import { SubdomainService } from '../services/subdomain.service';
import { CampaignService } from '../services/campaign.service';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { Campaign } from '../../models/campaign.model';
@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    TranslateModule
  ],
  //old
  // providers: [
  //   { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  // ],
  //old
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.css']
})
export class CreateCampaignComponent implements OnInit {

  campaignForm!: FormGroup;
  isEditMode = false;
  existingId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private campaignService: CampaignService,
    private subdomainService: SubdomainService,
    private authService: AuthService,
    public langService: LanguageService
  ) {}

  ngOnInit() {
    this.campaignForm = this.fb.group({
      name: ['', Validators.required],
      why: ['', Validators.required],
      goals: ['', Validators.required],
      method: ['', Validators.required],
      quote: ['', Validators.required],
      missionquote: ['', Validators.required],
      whatFor: ['', Validators.required],
      descriptionone: ['', Validators.required],
      descriptiontwo: ['', Validators.required],
      descriptionthree: ['', Validators.required],
      descriptionfour: ['', Validators.required],
      how: ['', Validators.required],
      contact: ['', Validators.required],
      gallery: [[]]
    });

    const nav = history.state;
    if (nav && nav.campaign) {
      this.isEditMode = true;
      this.existingId = nav.campaign.id;
      this.campaignForm.patchValue(nav.campaign);
    }
  }


  async onSubmit() {
  const payload: Campaign = { ...this.campaignForm.value } as Campaign;
  const currentCampaign = this.subdomainService.getCurrentCampaign();
  const isFallback = currentCampaign?.id === currentCampaign?.subdomain;

  if (!payload.name) {
    alert('Campaign Name is required!');
    return;
  }

  // if (this.isEditMode && this.existingId) {
  //   payload.id = this.existingId;
  //   payload.subdomain = currentCampaign?.subdomain ?? payload.name.toLowerCase().replace(/\s+/g, '-');

  //   if (isFallback) {
      
  //     this.subdomainService.refreshCampaign(payload);
  //     localStorage.setItem(`campaign_${payload.subdomain}`, JSON.stringify(payload));
  //     alert('Updated local fallback campaign (not saved to backend).');
  //     this.router.navigate(['/']);
  //     return;
  //   }

    
  //   this.campaignService.updateCampaign(payload).subscribe({
  //     next: (updated) => {
  //       this.subdomainService.refreshCampaign(updated);
  //       alert('Campaign updated successfully!');
  //       this.router.navigate(['/']);
  //     },
  //     error: (err) => {
  //       console.error('Update failed', err);
  //       alert('Campaign update failed. Check console.');
  //     }
  //   });

  // } else {
    
  //   payload.subdomain = payload.name.toLowerCase().replace(/\s+/g, '-');

  //   this.campaignService.createCampaign(payload).subscribe({
  //     next: (newCampaign) => {
  //       this.subdomainService.refreshCampaign(newCampaign);
  //       alert(`Campaign created! Subdomain: ${newCampaign.subdomain}`);
  //       // Redirect to new campaign subdomain
  //       if (newCampaign.subdomain) {
  //     window.location.href = `https://${newCampaign.subdomain}.mudhammataan.com`;
  //   }
  //     },
  //     error: (err) => {
  //   if (err.status === 401) {
  //     alert('Please login to create a campaign');
      
  //   } else {
  //     console.error('Creation failed', err);
  //   }
  // }
  //   });
  // }

  if (this.isEditMode && this.existingId) {
  payload.id = this.existingId;
  payload.subdomain = currentCampaign?.subdomain ?? payload.name.toLowerCase().replace(/\s+/g, '-');

  if (isFallback) {
    this.subdomainService.refreshCampaign(payload);
    localStorage.setItem(`campaign_${payload.subdomain}`, JSON.stringify(payload));
    alert('Updated local fallback campaign (not saved to backend).');
    this.router.navigate(['/']);
    return;
  }

  try {
    const updated = await this.campaignService.updateCampaign(payload);
    this.subdomainService.refreshCampaign(updated);
    alert('Campaign updated successfully!');
    this.router.navigate(['/']);
  } catch (err: any) {
    console.error('Update failed', err);
    alert('Campaign update failed. Check console.');
  }

} else {
  // Creating new campaign
  payload.subdomain = payload.name.toLowerCase().replace(/\s+/g, '-');

  try {
    const newCampaign = await this.campaignService.createCampaign(payload);
    this.subdomainService.refreshCampaign(newCampaign);
    alert(`Campaign created! Subdomain: ${newCampaign.subdomain}`);
    if (newCampaign.subdomain) {
      window.location.href = `https://${newCampaign.subdomain}.mudhammataan.com`;
    }
  } catch (err: any) {
    if (err.status === 401) {
      alert('Please login to create a campaign');
    } else {
      console.error('Creation failed', err);
    }
  }
}

}

  logout() {
    this.authService.logout()
      .then(() => alert('Logged out successfully!'))
      .catch(err => console.error('Logout failed', err));
  }
}

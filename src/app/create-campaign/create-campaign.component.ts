import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RouterModule, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SubdomainService, Campaign } from '../services/subdomain.service';

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatInputModule, MatFormFieldModule, MatButtonModule],
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
    private http: HttpClient,
    private subdomainService: SubdomainService
  ) {}

  ngOnInit() {
    this.campaignForm = this.fb.group({
      name: ['', Validators.required],
      why: ['', Validators.required],
      whatFor: ['', Validators.required],
      how: ['', Validators.required],
      contact: ['', Validators.required],
    });

    // If navigated with an existing campaign, prefill form
    const nav = history.state;
    if (nav && nav.campaign) {
      this.isEditMode = true;
      this.existingId = nav.campaign.id;
      this.campaignForm.patchValue(nav.campaign);
    }
  }

  onSubmit() {
    const payload: any = { ...this.campaignForm.value };

    if (this.isEditMode && this.existingId) {
      payload.id = this.existingId;

      // Preserve subdomain for edits
      payload.subdomain = this.subdomainService.getCurrentCampaign()?.subdomain;

      // PUT request to update campaign
  this.http.put<Campaign>(`${environment.apiBaseUrl}/campaign/update`, payload)
        .subscribe({
          next: (updatedCampaign) => {
            // 1️⃣ Update in-memory campaign immediately
            this.subdomainService.refreshCampaign(updatedCampaign);

            // 2️⃣ Redirect to homepage (or wherever you want)
            this.router.navigate(['/']);
          },
          error: (err) => console.error('Update failed', err)
        });

    } else {
      // POST request to create a new campaign
  this.http.post<Campaign>(`${environment.apiBaseUrl}/campaign/create`, payload)
        .subscribe({
          next: (newCampaign) => {
            alert(`Campaign created! Subdomain: ${newCampaign.subdomain}`);
            this.subdomainService.refreshCampaign(newCampaign);
            this.router.navigate(['/']);
          },
          error: (err) => console.error('Creation failed', err)
        });
    }
  }
}

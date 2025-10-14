import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { DonateComponent } from './donate/donate.component';
import { WhatWeDoComponent } from './what-we-do/what-we-do.component';
import { ContactComponent } from './contact/contact.component';
import { GalleryComponent } from './gallery/gallery.component';
import { MissionComponent } from './mission/mission.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CreateCampaignComponent } from './create-campaign/create-campaign.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'mission', component: MissionComponent },
      { path: 'whatwedo', component: WhatWeDoComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'donate', component: DonateComponent },
      { path: 'create-campaign', component: CreateCampaignComponent }
    ]
  },
  // ⬇️ Note: not-found is now OUTSIDE layout (no nav bar)
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' }
];

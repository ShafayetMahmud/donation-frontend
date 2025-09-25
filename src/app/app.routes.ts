import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { DonateComponent } from './donate/donate.component';
import { WhatWeDoComponent } from './what-we-do/what-we-do.component';
import { ContactComponent } from './contact/contact.component';
import { GalleryComponent } from './gallery/gallery.component';
import { MissionComponent } from './mission/mission.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },                    // Home page
      { path: 'mission', component: MissionComponent },              // Mission → reuse Home for now
      { path: 'whatwedo', component: WhatWeDoComponent },// What We Do
      { path: 'gallery', component: GalleryComponent },              // placeholder
      { path: 'contact', component: ContactComponent },              // placeholder
      { path: 'donate', component: DonateComponent }     // donation page
    ]
  }
];

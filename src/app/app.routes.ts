import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DonateComponent } from './donate/donate.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },   // load home page first
  { path: 'donate', component: DonateComponent }  // donation page when button clicked
];

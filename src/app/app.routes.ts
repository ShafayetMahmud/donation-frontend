import { Routes } from '@angular/router';
import { DonateComponent } from './donate/donate.component';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home },   // load home page first
  { path: 'donate', component: DonateComponent }  // donation page when button clicked
];

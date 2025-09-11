// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { DonateComponent } from './donate/donate.component';

// const routes: Routes = [
//   { path: '', redirectTo: 'donate', pathMatch: 'full' },
//   { path: 'donate', component: DonateComponent }
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DonateComponent } from './donate/donate.component';

const routes: Routes = [
  { path: 'mission', component: DonateComponent }, // temporary, replace later
  { path: 'what-we-do', component: DonateComponent }, // placeholder
  { path: 'gallery', component: DonateComponent }, // placeholder
  { path: 'contact', component: DonateComponent }, // placeholder
  { path: 'donate', component: DonateComponent },
  { path: '', redirectTo: '/donate', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


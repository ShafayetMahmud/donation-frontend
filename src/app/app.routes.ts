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
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { CashDonationEditComponent } from './cash-donation-edit/cash-donation-edit.component';
import { CashDonationCreateComponent } from './cash-donation-create/cash-donation-create.component';
import { CashDonationOverviewComponent } from './cash-donation-overview/cash-donation-overview.component';
import { AdminGuard } from './utils/admin.guard';
import { UserManagementComponent } from './user-management/user-management.component';

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
      { path: 'create-campaign', component: CreateCampaignComponent },

      // Cash donation routes
      { path: 'cash-donation', component: CashDonationOverviewComponent },
      { path: 'cash-donation/create', component: CashDonationCreateComponent },
      { path: 'cash-donation/edit/:id', component: CashDonationEditComponent },

      // { 
      //   path: 'user-management', 
      //   component: UserManagementComponent,
      //   canActivate: [AdminGuard] 
      // }
      { 
        path: 'user-management', 
        component: UserManagementComponent 
      }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' }
];


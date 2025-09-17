// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DonateComponent } from './donate/donate.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Home } from './home/home';
import { MatToolbarModule } from '@angular/material/toolbar';

const routes: Routes = [
  { path: '', component: DonateComponent }, // root route -> donate
  // { path: 'donate', component: DonateComponent } // optional alias
];

@NgModule({
  declarations: [],
  imports: [
    MatToolbarModule,   // ✅ needed for <mat-toolbar>
    MatButtonModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppComponent,
    BrowserAnimationsModule, // required for Angular Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    DonateComponent,
    Home,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule.forRoot(routes)
  ],
  // bootstrap: [AppComponent]
})
export class AppModule {}

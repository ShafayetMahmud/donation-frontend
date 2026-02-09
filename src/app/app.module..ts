// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DonateComponent } from './donate/donate.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { inject } from '@angular/core';
import { AuthInterceptor } from './services/auth.interceptor';
import { MsalModule, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { environment } from '../environments/environment';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  { path: '', component: DonateComponent },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  // { path: 'logout', loadComponent: () => import('./logout/logout.component').then(m => m.LogoutComponent) }
];

@NgModule({
  declarations: [],
  imports: [
    MatIconModule,
    MatToolbarModule,   // ✅ needed for <mat-toolbar>
    MatButtonModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppComponent,
    LoginComponent,
    BrowserAnimationsModule, // required for Angular Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    DonateComponent,
    HomeComponent,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule.forRoot(routes),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateHttpLoader
      }
    }),
    MsalModule.forRoot(
  new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.auth.clientId,
      authority: environment.msalConfig.auth.authority,
      redirectUri: window.location.origin + '/login', 
      postLogoutRedirectUri: window.location.origin 
      // redirectUri: environment.msalConfig.auth.redirectUri,
      // postLogoutRedirectUri: environment.msalConfig.auth.postLogoutRedirectUri
    },
    cache: { cacheLocation: 'localStorage' }  // storeAuthStateInCookie removed
  }),
  {
    interactionType: InteractionType.Redirect,  // uses redirect flow
    authRequest: environment.loginRequest
  },
  {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map()
  }
)

  ],

  providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  MsalService,
  MsalBroadcastService
]

  // bootstrap: [AppComponent]
})
export class AppModule {}

// import { bootstrapApplication } from '@angular/platform-browser';
// import { importProvidersFrom } from '@angular/core';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { provideRouter } from '@angular/router';
// import { MsalModule } from '@azure/msal-angular';
// import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
// import { environment } from './environments/environment';

// import {
//   TranslateModule,
//   TranslateLoader
// } from '@ngx-translate/core';
// import {
//   TranslateHttpLoader,
//   TRANSLATE_HTTP_LOADER_CONFIG
// } from '@ngx-translate/http-loader';

// import { AppComponent } from './app/app.component';
// import { routes } from './app/app.routes';
// import { AuthInterceptor } from './app/services/auth.interceptor';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideRouter(routes),
//     provideAnimations(),
//     provideHttpClient(withInterceptorsFromDi()),
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: AuthInterceptor,
//       multi: true
//     },

//     {
//       provide: TRANSLATE_HTTP_LOADER_CONFIG,
//       useValue: {
//         prefix: '/assets/i18n/',
//         suffix: '.json'
//       }
//     },

//     importProvidersFrom(
//       MsalModule.forRoot(
//         new PublicClientApplication({
//           auth: {
//             clientId: environment.msalConfig.auth.clientId,
//             authority: environment.msalConfig.auth.authority,
//             redirectUri: window.location.origin + '/login'
//           },
//           cache: { cacheLocation: 'localStorage' }
//         }),
//         {
//           interactionType: InteractionType.Redirect,
//           authRequest: environment.loginRequest
//         },
//         {
//           interactionType: InteractionType.Redirect,
//           protectedResourceMap: new Map()
//         }
//       )
//     ),

//     importProvidersFrom(
//       TranslateModule.forRoot({
//         loader: {
//           provide: TranslateLoader,
//           useClass: TranslateHttpLoader
//         },
//         defaultLanguage: 'en'
//       })
//     )
//   ]
// }).catch(err => console.error(err));


// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MsalModule, MsalService } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { environment } from './environments/environment';
import { APP_INITIALIZER } from '@angular/core';


import {
  TranslateModule,
  TranslateLoader
} from '@ngx-translate/core';
import {
  TranslateHttpLoader,
  TRANSLATE_HTTP_LOADER_CONFIG
} from '@ngx-translate/http-loader';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/services/auth.interceptor';
import { AuthService } from './app/services/auth.service';

export function initializeAuth(authService: AuthService) {
  return () => authService.restoreUserFromMsal();
}


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),

    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: '/assets/i18n/',
        suffix: '.json'
      }
    },

    importProvidersFrom(
      MsalModule.forRoot(
        new PublicClientApplication({
          auth: {
            clientId: environment.msalConfig.auth.clientId,
            authority: environment.msalConfig.auth.authority,
            // redirectUri: window.location.origin + '/login' //
            redirectUri: environment.msalConfig.auth.redirectUri //new
          },
          cache: {
            cacheLocation: 'localStorage',
            // storeAuthStateInCookie: true
          }
        }),
        {
          interactionType: InteractionType.Redirect,
          authRequest: environment.loginRequest
        },
        {
          interactionType: InteractionType.Redirect,
          protectedResourceMap: new Map()
        }
      )
    ),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateHttpLoader
        },
        defaultLanguage: 'en'
      })
    )
  ]
})
  // .then(async (appRef) => {

  //   // ⭐ CRITICAL: Handle MSAL redirect result
  //   const msalService = appRef.injector.get(MsalService);
  //   await msalService.instance.handleRedirectPromise();

  //   // ⭐ Restore user state (MSAL + Cookie fallback)
  //   const authService = appRef.injector.get(AuthService);
  //   await authService.restoreUserFromMsal();

  // })
  .catch(err => console.error(err));

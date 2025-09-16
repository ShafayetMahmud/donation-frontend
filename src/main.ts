// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
// import { provideForms } from '@angular/forms';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),  // ✅ needed for Angular Material
    provideHttpClient(),  // ✅ needed if you call APIs
    // provideForms()        // ✅ needed if you use ngModel / forms
  ]
}).catch(err => console.error(err));

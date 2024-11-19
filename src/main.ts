import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),provideAnimations(), 
    provideToastr({
      timeOut: 3000, // Auto dismiss after 3 seconds
      positionClass: 'toast-top-right', // Set position to top-right
      preventDuplicates: true, // Avoid duplicate notifications
    }),
  ],
}).catch(err => console.error(err));
 
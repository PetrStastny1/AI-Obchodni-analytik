import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/auth/auth.interceptor';
import { APOLLO_PROVIDER } from './app/core/graphql/apollo.config';

bootstrapApplication(App, {
  providers: [
    provideAnimations(),
    importProvidersFrom(NgApexchartsModule),
    provideHttpClient(withInterceptors([authInterceptor])),

    APOLLO_PROVIDER,

    ...appConfig.providers,
  ],
});

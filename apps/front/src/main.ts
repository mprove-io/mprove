import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import {
  ErrorHandler,
  enableProdMode,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideEnvironmentInitializer
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  BrowserModule,
  bootstrapApplication,
  Title
} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { enableElfProdMode } from '@ngneat/elf';
import {
  provideTippyConfig,
  provideTippyLoader
} from '@ngneat/helipopper/config';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import tippy from 'tippy.js';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app-routes';
import { AuthModule } from './app/modules/auth/auth.module';
import { DashboardsModule } from './app/modules/dashboards/dashboards.module';
import { BuilderModule } from './app/modules/files/files.module';
import { ModelsModule } from './app/modules/models/models.module';
import { NavModule } from './app/modules/nav/nav.module';
import { NavbarModule } from './app/modules/navbar/navbar.module';
import { OrgModule } from './app/modules/org/org.module';
import { ProfileModule } from './app/modules/profile/profile.module';
import { ProjectModule } from './app/modules/project/project.module';
import { ReportsModule } from './app/modules/reports/reports.module';
import { SharedModule } from './app/modules/shared/shared.module';
import { SpecialModule } from './app/modules/special/special.module';
import { ErrorHandlerService } from './app/services/error-handler.service';
import { HighLightService } from './app/services/highlight.service';
import { environment } from './environments/environment';
import { initTelemetry } from './init-telemetry';

if (environment.production) {
  enableProdMode();
  enableElfProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // useClass must be last in list by order
    provideAppInitializer(() => initTelemetry()),
    provideEnvironmentInitializer(async () => {
      // const highLightService = inject(HighLightService); // if uncomment - remove initHighlighter() call from service constructor
      // await highLightService.initHighlighter();
      inject(HighLightService);
    }),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      BrowserModule,
      AuthModule,
      NavModule,
      NavbarModule,
      ProfileModule,
      OrgModule,
      ProjectModule,
      BuilderModule,
      ModelsModule,
      NgxSpinnerModule,
      BrowserAnimationsModule,
      SharedModule,
      SpecialModule,
      ReactiveFormsModule,
      FormsModule,
      NgSelectModule,
      DashboardsModule,
      ReportsModule,
      UiSwitchModule
    ),
    provideRouter(appRoutes),
    provideTippyLoader(() => tippy),
    provideTippyConfig({
      defaultVariation: 'tooltip',
      variations: {
        tooltip: {
          delay: 500,
          theme: undefined,
          arrow: false,
          animation: 'scale',
          trigger: 'mouseenter',
          offset: [0, 5]
        },
        popper: {
          theme: 'light',
          arrow: true,
          offset: [0, 10],
          animation: undefined,
          trigger: 'click',
          interactive: true
        },
        menu: {
          theme: undefined,
          placement: 'bottom-end',
          animation: undefined,
          trigger: 'click manual',
          interactive: true,
          appendTo: (ref: Element) => document.body,
          arrow: false,
          offset: [0, 7]
        },
        menuRow: {
          theme: undefined,
          placement: 'bottom-end',
          animation: undefined,
          trigger: 'click manual',
          interactive: true,
          appendTo: (ref: Element) => document.body,
          arrow: false,
          offset: [0, 7]
        }
      }
    }),
    NgxImageCompressService,
    Title,
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService
    }
    // useClass must be last in list by order
  ]
}).catch(err => console.error(err));

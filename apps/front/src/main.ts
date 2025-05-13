import { HttpClientModule } from '@angular/common/http';
import {
  ErrorHandler,
  enableProdMode,
  importProvidersFrom
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  BrowserModule,
  Title,
  bootstrapApplication
} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { enableElfProdMode } from '@ngneat/elf';
import { provideTippyConfig } from '@ngneat/helipopper';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { appRoutes } from './app/app-routes';
import { AppComponent } from './app/app.component';
import { AuthModule } from './app/modules/auth/auth.module';
import { ChartsModule } from './app/modules/charts/charts.module';
import { DashboardsModule } from './app/modules/dashboards/dashboards.module';
import { FilesModule } from './app/modules/files/files.module';
import { NavModule } from './app/modules/nav/nav.module';
import { NavbarModule } from './app/modules/navbar/navbar.module';
import { OrgModule } from './app/modules/org/org.module';
import { ProfileModule } from './app/modules/profile/profile.module';
import { ProjectModule } from './app/modules/project/project.module';
import { ReportsModule } from './app/modules/reports/reports.module';
import { SharedModule } from './app/modules/shared/shared.module';
import { SpecialModule } from './app/modules/special/special.module';
import { ErrorHandlerService } from './app/services/error-handler.service';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  enableElfProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // useClass must be last in list by order
    importProvidersFrom(
      BrowserModule,
      HttpClientModule,
      AuthModule,
      NavModule,
      NavbarModule,
      ProfileModule,
      OrgModule,
      ProjectModule,
      FilesModule,
      ChartsModule,
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
    // provideHotToastConfig(),
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
  ]
}).catch(err => console.error(err));

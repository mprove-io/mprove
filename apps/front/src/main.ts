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
import { MonacoEditorModule, MonacoProviderService } from 'ng-monaco-editor';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { appRoutes } from './app/app-routes';
import { AppComponent } from './app/app.component';
import { AuthModule } from './app/modules/auth/auth.module';
import { DashboardModule } from './app/modules/dashboard/dashboard.module';
import { DashboardsModule } from './app/modules/dashboards/dashboards.module';
import { FilesModule } from './app/modules/files/files.module';
import { MetricsModule } from './app/modules/metrics/metrics.module';
import { ModelModule } from './app/modules/model/model.module';
import { ModelsModule } from './app/modules/models/models.module';
import { NavModule } from './app/modules/nav/nav.module';
import { NavbarModule } from './app/modules/navbar/navbar.module';
import { OrgModule } from './app/modules/org/org.module';
import { ProfileModule } from './app/modules/profile/profile.module';
import { ProjectModule } from './app/modules/project/project.module';
import { SharedModule } from './app/modules/shared/shared.module';
import { SpecialModule } from './app/modules/special/special.module';
import { VisualizationsModule } from './app/modules/visualizations/visualizations.module';
import { CustomMonacoProviderService } from './app/services/custom-monaco-provider.service';
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
      ModelModule,
      DashboardModule,
      NgxSpinnerModule,
      BrowserAnimationsModule,
      MonacoEditorModule.forRoot({
        dynamicImport: () => import('monaco-editor')
      }),
      SharedModule,
      SpecialModule,
      ReactiveFormsModule,
      FormsModule,
      NgSelectModule,
      VisualizationsModule,
      DashboardsModule,
      ModelsModule,
      MetricsModule,
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
      provide: MonacoProviderService,
      useClass: CustomMonacoProviderService
    },
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService
    }
  ]
}).catch(err => console.error(err));

import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogModule } from '@ngneat/dialog';
import {
  popperVariation,
  TippyModule,
  tooltipVariation
} from '@ngneat/helipopper';
import { MonacoEditorModule, MonacoProviderService } from 'ng-monaco-editor';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { appDialogs } from './app-dialogs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';
import { FilesModule } from './modules/files/files.module';
import { ModelModule } from './modules/model/model.module';
import { ModelsModule } from './modules/models/models.module';
import { NavModule } from './modules/nav/nav.module';
import { NavbarModule } from './modules/navbar/navbar.module';
import { OrgModule } from './modules/org/org.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProjectModule } from './modules/project/project.module';
import { SharedModule } from './modules/shared/shared.module';
import { SpecialModule } from './modules/special/special.module';
import { VisualizationsModule } from './modules/visualizations/visualizations.module';
import { CustomMonacoProviderService } from './services/custom-monaco-provider.service';
import { ErrorHandlerService } from './services/error-handler.service';

registerLocaleData(en);

@NgModule({
  declarations: [AppComponent, ...appDialogs],
  entryComponents: [...appDialogs],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    DialogModule.forRoot(),
    TippyModule.forRoot({
      defaultVariation: 'tooltip',
      variations: {
        tooltip: tooltipVariation,
        popper: popperVariation,
        menu: {
          theme: null,
          placement: 'bottom-end',
          animation: null,
          trigger: 'click manual',
          interactive: true,
          appendTo: 'parent',
          arrow: false,
          offset: [0, 7]
        }
      }
    }),
    MonacoEditorModule.forRoot({
      dynamicImport: () => import('monaco-editor')
    }),
    SharedModule,
    SpecialModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    ImageCropperModule,
    VisualizationsModule,
    DashboardsModule,
    ModelsModule,
    UiSwitchModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService
    },
    NgxImageCompressService,
    Title,
    {
      provide: MonacoProviderService,
      useClass: CustomMonacoProviderService
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogModule } from '@ngneat/dialog';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxSpinnerModule } from 'ngx-spinner';
import { appDialogs } from './app-dialogs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './modules/auth/auth.module';
import { BlockmlModule } from './modules/blockml/blockml.module';
import { ModelModule } from './modules/model/model.module';
import { NavModule } from './modules/nav/nav.module';
import { NavbarModule } from './modules/navbar/navbar.module';
import { OrgModule } from './modules/org/org.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProjectModule } from './modules/project/project.module';
import { SharedModule } from './modules/shared/shared.module';
import { SpecialModule } from './modules/special/special.module';
import { ErrorHandlerService } from './services/error-handler.service';

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
    BlockmlModule,
    ModelModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    DialogModule.forRoot(),
    SharedModule,
    SpecialModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    ImageCropperModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService
    },
    NgxImageCompressService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

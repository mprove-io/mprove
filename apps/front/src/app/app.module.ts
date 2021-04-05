import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogModule } from '@ngneat/dialog';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorDialogComponent } from './dialogs/error-dialog/error-dialog.component';
import { AuthModule } from './modules/auth/auth.module';
import { NavModule } from './modules/nav/nav.module';
import { NavbarModule } from './modules/navbar/navbar.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SharedModule } from './modules/shared/shared.module';
import { ErrorHandlerService } from './services/error-handler.service';

@NgModule({
  declarations: [AppComponent, ErrorDialogComponent],
  entryComponents: [ErrorDialogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AuthModule,
    NavModule,
    NavbarModule,
    ProfileModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    DialogModule.forRoot(),
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

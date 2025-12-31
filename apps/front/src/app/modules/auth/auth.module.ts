import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from '../shared/shared.module';
import { RegisterComponent } from './main/01-register/register.component';
import { VerifyEmailComponent } from './main/02-verify-email/verify-email.component';
import { ConfirmEmailComponent } from './main/03-confirm-email/confirm-email.component';
import { EmailConfirmedComponent } from './main/04-email-confirmed/email-confirmed.component';
import { LoginComponent } from './main/05-login/login.component';
import { UserDeletedComponent } from './main/06-user-deleted/user-deleted.component';
import { CompleteRegistrationComponent } from './main/07-complete-registration/complete-registration.component';
import { ForgotPasswordComponent } from './password/01-forgot-password/forgot-password.component';
import { PasswordResetSentComponent } from './password/02-password-reset-sent/password-reset-sent.component';
import { UpdatePasswordComponent } from './password/03-update-password/update-password.component';
import { NewPasswordWasSetComponent } from './password/04-new-password-was-set/new-password-was-set.component';

@NgModule({
  declarations: [
    // main
    RegisterComponent,
    VerifyEmailComponent,
    ConfirmEmailComponent,
    EmailConfirmedComponent,
    LoginComponent,
    UserDeletedComponent,
    CompleteRegistrationComponent,
    // password
    ForgotPasswordComponent,
    PasswordResetSentComponent,
    UpdatePasswordComponent,
    NewPasswordWasSetComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, NgxSpinnerModule]
})
export class AuthModule {}

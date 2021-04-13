import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RegisterComponent } from './main/1_register/register.component';
import { VerifyEmailComponent } from './main/2_verify-email/verify-email.component';
import { ConfirmEmailComponent } from './main/3_confirm-email/confirm-email.component';
import { EmailConfirmedComponent } from './main/4_email-confirmed/email-confirmed.component';
import { LoginComponent } from './main/5_login/login.component';
import { ForgotPasswordComponent } from './password/1_forgot-password/forgot-password.component';
import { PasswordResetSentComponent } from './password/2_password-reset-sent/password-reset-sent.component';
import { UpdatePasswordComponent } from './password/3_update-password/update-password.component';
import { NewPasswordWasSetComponent } from './password/4_new-password-was-set/new-password-was-set.component';

@NgModule({
  declarations: [
    // main
    RegisterComponent,
    VerifyEmailComponent,
    ConfirmEmailComponent,
    EmailConfirmedComponent,
    LoginComponent,
    // password
    ForgotPasswordComponent,
    PasswordResetSentComponent,
    UpdatePasswordComponent,
    NewPasswordWasSetComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class AuthModule {}

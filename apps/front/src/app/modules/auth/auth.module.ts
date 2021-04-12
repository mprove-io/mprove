import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
  declarations: [
    ConfirmEmailComponent,
    ForgotPasswordComponent,
    UpdatePasswordComponent,
    LoginComponent,
    RegisterComponent,
    VerifyEmailComponent
  ],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AuthModule {}

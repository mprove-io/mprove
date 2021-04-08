import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
  declarations: [
    RegisterComponent,
    LoginComponent,
    VerifyEmailComponent,
    ConfirmEmailComponent
  ],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AuthModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
  declarations: [LoginComponent, VerifyEmailComponent],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AuthModule {}

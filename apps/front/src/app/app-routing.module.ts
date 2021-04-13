import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { constants } from '~front/barrels/constants';
import { RegisterComponent } from './modules/auth/main/1_register/register.component';
import { VerifyEmailComponent } from './modules/auth/main/2_verify-email/verify-email.component';
import { ConfirmEmailComponent } from './modules/auth/main/3_confirm-email/confirm-email.component';
import { EmailConfirmedComponent } from './modules/auth/main/4_email-confirmed/email-confirmed.component';
import { LoginComponent } from './modules/auth/main/5_login/login.component';
import { ForgotPasswordComponent } from './modules/auth/password/1_forgot-password/forgot-password.component';
import { PasswordResetSentComponent } from './modules/auth/password/2_password-reset-sent/password-reset-sent.component';
import { UpdatePasswordComponent } from './modules/auth/password/3_update-password/update-password.component';
import { NewPasswordWasSetComponent } from './modules/auth/password/4_new-password-was-set/new-password-was-set.component';
import { NavComponent } from './modules/nav/nav.component';
import { NavbarComponent } from './modules/navbar/navbar.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { NavBarResolver } from './resolvers/navbar.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: constants.PATH_LOGIN,
    pathMatch: 'full'
  },
  {
    component: NavComponent,
    path: '',
    children: [
      {
        component: RegisterComponent,
        path: constants.PATH_REGISTER
      },
      {
        component: VerifyEmailComponent,
        path: constants.PATH_VERIFY_EMAIL
      },
      {
        component: ConfirmEmailComponent,
        path: constants.PATH_CONFIRM_EMAIL
      },
      {
        component: EmailConfirmedComponent,
        path: constants.PATH_EMAIL_CONFIRMED
      },
      {
        component: LoginComponent,
        path: constants.PATH_LOGIN
      },
      {
        component: ForgotPasswordComponent,
        path: constants.PATH_FORGOT_PASSWORD
      },
      {
        component: PasswordResetSentComponent,
        path: constants.PATH_PASSWORD_RESET_SENT
      },
      {
        component: UpdatePasswordComponent,
        path: constants.PATH_UPDATE_PASSWORD
      },
      {
        component: NewPasswordWasSetComponent,
        path: constants.PATH_NEW_PASSWORD_WAS_SET
      }
    ]
  },
  {
    component: NavbarComponent,
    path: '',
    resolve: [NavBarResolver],
    children: [
      {
        component: ProfileComponent,
        path: constants.PATH_PROFILE
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

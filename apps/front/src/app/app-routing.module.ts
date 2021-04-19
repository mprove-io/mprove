import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { common } from '~front/barrels/common';
import { RegisterComponent } from './modules/auth/main/01-register/register.component';
import { VerifyEmailComponent } from './modules/auth/main/02-verify-email/verify-email.component';
import { ConfirmEmailComponent } from './modules/auth/main/03-confirm-email/confirm-email.component';
import { EmailConfirmedComponent } from './modules/auth/main/04-email-confirmed/email-confirmed.component';
import { LoginComponent } from './modules/auth/main/05-login/login.component';
import { ForgotPasswordComponent } from './modules/auth/password/01-forgot-password/forgot-password.component';
import { PasswordResetSentComponent } from './modules/auth/password/02-password-reset-sent/password-reset-sent.component';
import { UpdatePasswordComponent } from './modules/auth/password/03-update-password/update-password.component';
import { NewPasswordWasSetComponent } from './modules/auth/password/04-new-password-was-set/new-password-was-set.component';
import { NavComponent } from './modules/nav/nav.component';
import { NavbarComponent } from './modules/navbar/navbar.component';
import { ProComponent } from './modules/profile/pro/pro.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { NavBarResolver } from './resolvers/navbar.resolver';
import { ProfileResolver } from './resolvers/profile.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: common.PATH_LOGIN,
    pathMatch: 'full'
  },
  {
    component: NavComponent,
    path: '',
    children: [
      {
        component: RegisterComponent,
        path: common.PATH_REGISTER
      },
      {
        component: VerifyEmailComponent,
        path: common.PATH_VERIFY_EMAIL
      },
      {
        component: ConfirmEmailComponent,
        path: common.PATH_CONFIRM_EMAIL
      },
      {
        component: EmailConfirmedComponent,
        path: common.PATH_EMAIL_CONFIRMED
      },
      {
        component: LoginComponent,
        path: common.PATH_LOGIN
      },
      {
        component: ForgotPasswordComponent,
        path: common.PATH_FORGOT_PASSWORD
      },
      {
        component: PasswordResetSentComponent,
        path: common.PATH_PASSWORD_RESET_SENT
      },
      {
        component: UpdatePasswordComponent,
        path: common.PATH_UPDATE_PASSWORD
      },
      {
        component: NewPasswordWasSetComponent,
        path: common.PATH_NEW_PASSWORD_WAS_SET
      }
    ]
  },
  {
    component: NavbarComponent,
    path: '',
    resolve: [NavBarResolver],
    children: [
      {
        component: PasswordResetSentComponent,
        path: common.PATH_PASSWORD_RESET_SENT_AUTH
      },
      {
        component: ProfileComponent,
        path: common.PATH_PROFILE,
        resolve: [ProfileResolver]
      },
      {
        component: ProComponent,
        path: common.PATH_PRO
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

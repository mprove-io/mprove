import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { constants } from '~front/barrels/constants';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { VerifyEmailComponent } from './modules/auth/verify-email/verify-email.component';
import { NavComponent } from './modules/nav/nav.component';
import { NavbarComponent } from './modules/navbar/navbar.component';
import { ProfileComponent } from './modules/profile/profile.component';

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
        component: LoginComponent,
        path: constants.PATH_LOGIN
      }
    ]
  },
  {
    component: NavbarComponent,
    path: '',
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

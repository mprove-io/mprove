import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { constants } from '~front/barrels/constants';
import { LoginComponent } from './modules/auth/login/login.component';
import { VerifyEmailComponent } from './modules/auth/verify-email/verify-email.component';
import { NavComponent } from './modules/nav/nav.component';
import { ProfileComponent } from './modules/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: constants.PATH_LOGIN,
    pathMatch: 'full'
  },
  {
    component: LoginComponent,
    path: constants.PATH_LOGIN
  },
  {
    component: VerifyEmailComponent,
    path: constants.PATH_VERIFY_EMAIL
  },
  {
    component: NavComponent,
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

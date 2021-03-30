import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { constants } from '~front/barrels/constants';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/' + constants.PATH_LOGIN,
    pathMatch: 'full'
  },
  {
    component: LoginComponent,
    path: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

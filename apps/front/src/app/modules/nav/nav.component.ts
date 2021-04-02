import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'mprove-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent {
  constructor(private router: Router) {}

  signUp() {
    this.router.navigate([constants.PATH_REGISTER]);
  }
  login() {
    this.router.navigate([constants.PATH_LOGIN]);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-new-password-was-set',
  templateUrl: './new-password-was-set.component.html'
})
export class NewPasswordWasSetComponent {
  constructor(private router: Router) {}

  login() {
    this.router.navigate([constants.PATH_LOGIN]);
  }
}

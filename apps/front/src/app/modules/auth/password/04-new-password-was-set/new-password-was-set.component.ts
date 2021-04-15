import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-new-password-was-set',
  templateUrl: './new-password-was-set.component.html'
})
export class NewPasswordWasSetComponent {
  constructor(private router: Router) {}

  login() {
    this.router.navigate([common.PATH_LOGIN]);
  }
}

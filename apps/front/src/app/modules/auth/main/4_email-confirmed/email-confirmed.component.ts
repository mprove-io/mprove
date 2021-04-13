import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-email-confirmed',
  templateUrl: './email-confirmed.component.html'
})
export class EmailConfirmedComponent {
  constructor(private router: Router) {}

  ok() {
    this.router.navigate([common.PATH_LOGIN]);
  }
}

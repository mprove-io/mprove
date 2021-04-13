import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-email-confirmed',
  templateUrl: './email-confirmed.component.html'
})
export class EmailConfirmedComponent {
  constructor(private router: Router) {}

  ok() {
    this.router.navigate([constants.PATH_LOGIN]);
  }
}

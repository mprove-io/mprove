import { Component } from '@angular/core';
import { UserQuery } from '~front/app/queries/user.query';

@Component({
  selector: 'mprove-verify-email',
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent {
  email$ = this.userQuery.select(state => state.email);

  constructor(private userQuery: UserQuery) {}
}

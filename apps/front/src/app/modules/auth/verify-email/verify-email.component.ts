import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-verify-email',
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent implements OnInit {
  email$ = this.userQuery
    .select(state => state.email)
    .pipe(
      tap(x => {
        if (common.isUndefined(x)) {
          this.authService.logout();
        }
      })
    );

  constructor(private userQuery: UserQuery, private authService: AuthService) {}

  ngOnInit() {
    localStorage.removeItem('token');
    this.authService.startWatch();
  }
}

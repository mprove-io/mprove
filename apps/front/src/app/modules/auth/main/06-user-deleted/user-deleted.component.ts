import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { AuthService } from '~front/app/services/auth.service';
import { UserStore } from '~front/app/stores/user.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-user-deleted',
  templateUrl: './user-deleted.component.html'
})
export class UserDeletedComponent implements OnInit {
  email: string;

  constructor(
    private router: Router,
    private userQuery: UserQuery,
    private userStore: UserStore,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userQuery.email$
      .pipe(
        tap(x => (this.email = x)),
        take(1)
      )
      .subscribe();

    this.authService.clearLocalStorage();
    this.userStore.reset();
  }

  createNewAccount() {
    this.router.navigate([common.PATH_REGISTER]);
  }
}

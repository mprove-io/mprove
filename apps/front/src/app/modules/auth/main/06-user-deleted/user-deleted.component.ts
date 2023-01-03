import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-user-deleted',
  templateUrl: './user-deleted.component.html'
})
export class UserDeletedComponent implements OnInit {
  pageTitle = constants.USER_DELETED_PAGE_TITLE;

  email: string;

  constructor(
    private router: Router,
    private userQuery: UserQuery,
    private authService: AuthService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.userQuery.email$
      .pipe(
        tap(x => (this.email = x)),
        take(1)
      )
      .subscribe();

    this.authService.clearLocalStorage();
    this.userQuery.reset();
  }

  createNewAccount() {
    this.router.navigate([common.PATH_REGISTER]);
  }
}

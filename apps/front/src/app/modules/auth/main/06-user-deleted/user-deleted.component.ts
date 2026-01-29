import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { USER_DELETED_PAGE_TITLE } from '#common/constants/page-titles';
import { PATH_REGISTER } from '#common/constants/top';
import { UserQuery } from '#front/app/queries/user.query';
import { AuthService } from '#front/app/services/auth.service';

@Component({
  standalone: false,
  selector: 'm-user-deleted',
  templateUrl: './user-deleted.component.html'
})
export class UserDeletedComponent implements OnInit {
  pageTitle = USER_DELETED_PAGE_TITLE;

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
    this.router.navigate([PATH_REGISTER]);
  }
}

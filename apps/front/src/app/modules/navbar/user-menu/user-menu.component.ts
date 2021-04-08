import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserQuery } from '~front/app/queries/user.query';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-user-menu',
  templateUrl: './user-menu.component.html'
})
export class UserMenuComponent implements OnInit {
  isUserMenuOpen = false;

  initials$ = this.userQuery.select(state => {
    console.log(state);

    let firstLetter = common.isDefined(state.firstName)
      ? state.firstName[0]
      : state.alias[0];

    let secondLetter =
      common.isDefined(state.firstName) && common.isDefined(state.lastName)
        ? state.lastName[0]
        : state.alias.length > 1
        ? state.alias[1]
        : '_';

    return firstLetter + secondLetter;
  });

  lastUrl: string;

  pathProfile = constants.PATH_PROFILE;

  constructor(
    private userQuery: UserQuery,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[1];
  }

  logout() {
    this.authService.logout();
  }
}

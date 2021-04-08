import { Component } from '@angular/core';
import { UserQuery } from '~front/app/queries/user.query';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-user-menu',
  templateUrl: './user-menu.component.html'
})
export class UserMenuComponent {
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
  constructor(private userQuery: UserQuery) {}
}

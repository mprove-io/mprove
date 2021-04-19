import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { UserState, UserStore } from '~front/app/stores/user.store';
import { common } from '~front/barrels/common';

@Injectable({ providedIn: 'root' })
export class UserQuery extends Query<UserState> {
  initials$ = this.select(state => {
    let firstLetter = common.isDefined(state.firstName)
      ? state.firstName[0]
      : state.alias[0];

    let secondLetter =
      common.isDefined(state.firstName) && common.isDefined(state.lastName)
        ? state.lastName[0]
        : state.alias.length > 1
        ? state.alias[1]
        : '_';

    return firstLetter.toUpperCase() + secondLetter.toUpperCase();
  });

  fullName$ = this.select(state => {
    if (
      common.isUndefined(state.firstName) &&
      common.isUndefined(state.lastName)
    ) {
      let second = state.alias.length > 1 ? state.alias[1] : '_';

      return state.alias[0].toUpperCase() + ' ' + second.toUpperCase();
    }

    return state.firstName.toUpperCase() + state.lastName.toUpperCase();
  });

  email$ = this.select(state => state.email);
  timezone$ = this.select(state => state.timezone);

  constructor(protected store: UserStore) {
    super(store);
  }
}

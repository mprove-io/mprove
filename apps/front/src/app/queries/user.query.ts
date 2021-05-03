import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { UserState, UserStore } from '~front/app/stores/user.store';
import { common } from '~front/barrels/common';
import { getFullName } from '../functions/get-full-name';

@Injectable({ providedIn: 'root' })
export class UserQuery extends Query<UserState> {
  initials$ = this.select(state => {
    // console.log(state);

    let firstLetter =
      common.isDefined(state.firstName) && state.firstName.length > 0
        ? state.firstName[0]
        : state.alias[0];

    let secondLetter =
      common.isDefined(state.firstName) &&
      state.firstName.length > 0 &&
      common.isDefined(state.lastName) &&
      state.lastName.length > 0
        ? state.lastName[0]
        : common.isDefined(state.firstName) && state.firstName.length > 1
        ? state.firstName[1]
        : state.alias.length > 1
        ? state.alias[1]
        : '_';

    return (
      common.capitalizeFirstLetter(firstLetter) +
      common.capitalizeFirstLetter(secondLetter)
    );
  });

  fullName$ = this.select(state => getFullName(state));

  email$ = this.select(state => state.email);
  userId$ = this.select(state => state.userId);
  timezone$ = this.select(state => state.timezone);

  constructor(protected store: UserStore) {
    super(store);
  }
}

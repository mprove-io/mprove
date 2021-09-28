import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { UserState, UserStore } from '~front/app/stores/user.store';
import { getFullName } from '../functions/get-full-name';
import { makeInitials } from '../functions/make-initials';

@Injectable({ providedIn: 'root' })
export class UserQuery extends Query<UserState> {
  initials$ = this.select(state => {
    let initials = makeInitials({
      firstName: state.firstName,
      lastName: state.lastName,
      alias: state.alias
    });

    return initials;
  });

  fullName$ = this.select(state => getFullName(state));

  email$ = this.select(state => state.email);
  alias$ = this.select(state => state.alias);
  userId$ = this.select(state => state.userId);
  timezone$ = this.select(state => state.timezone);

  constructor(protected store: UserStore) {
    super(store);
  }
}

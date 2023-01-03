import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { getFullName } from '../functions/get-full-name';
import { makeInitials } from '../functions/make-initials';
import { BaseQuery } from './base.query';

export class UserState extends common.User {}

let userState: UserState = {
  userId: undefined,
  email: undefined,
  alias: undefined,
  firstName: undefined,
  lastName: undefined,
  timezone: undefined,
  isEmailVerified: undefined,
  serverTs: 1
};

@Injectable({ providedIn: 'root' })
export class UserQuery extends BaseQuery<UserState> {
  initials$ = this.store.pipe(
    select(state => {
      let initials = makeInitials({
        firstName: state.firstName,
        lastName: state.lastName,
        alias: state.alias
      });

      return initials;
    })
  );

  fullName$ = this.store.pipe(select(state => getFullName(state)));

  email$ = this.store.pipe(select(state => state.email));
  alias$ = this.store.pipe(select(state => state.alias));
  userId$ = this.store.pipe(select(state => state.userId));
  timezone$ = this.store.pipe(select(state => state.timezone));

  constructor() {
    super(createStore({ name: 'user' }, withProps<UserState>(userState)));
  }
}

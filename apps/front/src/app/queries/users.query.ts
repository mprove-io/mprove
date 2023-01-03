import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { BaseQuery } from './base.query';

export class UsersState {
  users: apiToBackend.OrgUsersItem[];
  total: number;
}

let usersState: UsersState = {
  users: [],
  total: 0
};

@Injectable({ providedIn: 'root' })
export class UsersQuery extends BaseQuery<UsersState> {
  users$ = this.store.pipe(select(state => state.users));
  total$ = this.store.pipe(select(state => state.total));

  constructor() {
    super(createStore({ name: 'users' }, withProps<UsersState>(usersState)));
  }
}

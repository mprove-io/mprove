import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { OrgUsersItem } from '#common/interfaces/to-backend/org-users/to-backend-get-org-users';
import { BaseQuery } from './base.query';

export class UsersState {
  users: OrgUsersItem[];
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

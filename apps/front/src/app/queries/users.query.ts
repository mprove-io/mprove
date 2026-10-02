import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { OrgUsersItem } from '#common/types/backend/parts/org-users/org-users-item';
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

import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { ServerUsersItem } from '#common/types/backend/parts/users/server-users-item';
import { BaseQuery } from './base.query';

export class ServerUsersState {
  serverUsers: ServerUsersItem[];
  total: number;
}

let serverUsersState: ServerUsersState = {
  serverUsers: [],
  total: 0
};

@Injectable({ providedIn: 'root' })
export class ServerUsersQuery extends BaseQuery<ServerUsersState> {
  serverUsers$ = this.store.pipe(select(state => state.serverUsers));
  total$ = this.store.pipe(select(state => state.total));

  constructor() {
    super(
      createStore(
        { name: 'server-users' },
        withProps<ServerUsersState>(serverUsersState)
      )
    );
  }
}

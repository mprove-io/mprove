import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { ServerUsersItem } from '#common/zod/to-backend/users/to-backend-get-server-users';
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

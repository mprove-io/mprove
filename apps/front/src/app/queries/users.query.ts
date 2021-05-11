import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { UsersState, UsersStore } from '../stores/users.store';

@Injectable({ providedIn: 'root' })
export class UsersQuery extends Query<UsersState> {
  users$ = this.select(state => state.users);
  total$ = this.select(state => state.total);

  constructor(protected store: UsersStore) {
    super(store);
  }
}

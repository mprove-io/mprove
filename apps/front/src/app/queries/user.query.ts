import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { UserState, UserStore } from '~front/app/stores/user.store';

@Injectable({ providedIn: 'root' })
export class UserQuery extends Query<UserState> {
  constructor(protected store: UserStore) {
    super(store);
  }
}

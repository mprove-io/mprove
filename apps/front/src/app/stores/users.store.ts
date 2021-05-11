import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { apiToBackend } from '~front/barrels/api-to-backend';

export class UsersState {
  users: apiToBackend.OrgUsersItem[];
  total: number;
}

function createInitialState(): UsersState {
  return {
    users: [],
    total: 0
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'users',
  resettable: true
})
export class UsersStore extends Store<UsersState> {
  constructor() {
    super(createInitialState());
  }
}

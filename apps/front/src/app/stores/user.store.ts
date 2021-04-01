import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export type UserState = common.User;

export function createInitialState(): UserState {
  return {
    userId: null,
    email: null,
    alias: null,
    firstName: null,
    lastName: null,
    timezone: null,
    status: null,
    isEmailVerified: null,
    serverTs: 1
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'user',
  resettable: true
})
export class UserStore extends Store<UserState> {
  constructor() {
    super(createInitialState());
  }
}

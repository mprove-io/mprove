import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class UserState extends common.User {}

export function createInitialState(): UserState {
  return {
    userId: undefined,
    email: undefined,
    alias: undefined,
    firstName: undefined,
    lastName: undefined,
    timezone: undefined,
    status: undefined,
    isEmailVerified: undefined,
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

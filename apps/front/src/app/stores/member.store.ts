import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class MemberState extends common.Member {}

function createInitialState(): MemberState {
  return {
    projectId: undefined,
    memberId: undefined,
    email: undefined,
    alias: undefined,
    firstName: undefined,
    lastName: undefined,
    fullName: undefined,
    avatarSmall: undefined,
    timezone: undefined,
    roles: undefined,
    envs: undefined,
    isAdmin: undefined,
    isEditor: undefined,
    isExplorer: undefined,
    serverTs: 1
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'member',
  resettable: true
})
export class MemberStore extends Store<MemberState> {
  constructor() {
    super(createInitialState());
  }
}

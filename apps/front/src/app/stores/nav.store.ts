import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export class NavState {
  avatarSmall: string;
  avatarBig: string;
  orgId: string;
  orgName: string;
  projectId: string;
  projectName: string;
  isRepoProd: boolean;
  branchId: string;
}

function createInitialState(): NavState {
  return {
    avatarSmall: undefined,
    avatarBig: undefined,
    orgId: undefined,
    orgName: undefined,
    projectId: undefined,
    projectName: undefined,
    isRepoProd: undefined,
    branchId: undefined
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'nav',
  resettable: true
})
export class NavStore extends Store<NavState> {
  constructor() {
    super(createInitialState());
  }

  clearNavAndSkipAvatar() {
    this.update(state =>
      Object.assign({}, state, {
        orgId: undefined,
        orgName: undefined,
        projectId: undefined,
        projectName: undefined,
        isRepoProd: undefined,
        branchId: undefined
      })
    );
  }
}

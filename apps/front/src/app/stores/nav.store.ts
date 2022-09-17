import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export class NavState {
  avatarSmall: string;
  avatarBig: string;
  orgId: string;
  orgOwnerId: string;
  orgName: string;
  projectId: string;
  projectName: string;
  projectDefaultBranch: string;
  isRepoProd: boolean;
  branchId: string;
  serverTimeDiff: number;
}

function createInitialState(): NavState {
  return {
    avatarSmall: undefined,
    avatarBig: undefined,
    orgId: undefined,
    orgOwnerId: undefined,
    orgName: undefined,
    projectId: undefined,
    projectName: undefined,
    projectDefaultBranch: undefined,
    isRepoProd: undefined,
    branchId: undefined,
    serverTimeDiff: undefined
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

  clearOrgAndDeps() {
    this.update(state =>
      Object.assign({}, state, <NavState>{
        orgId: undefined,
        orgName: undefined,
        orgOwnerId: undefined,
        projectId: undefined,
        projectName: undefined,
        projectDefaultBranch: undefined,
        isRepoProd: true,
        branchId: undefined
      })
    );
  }

  clearProjectAndDeps() {
    this.update(state =>
      Object.assign({}, state, <NavState>{
        projectId: undefined,
        projectName: undefined,
        projectDefaultBranch: undefined,
        isRepoProd: true,
        branchId: undefined
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export class NavState {
  avatarSmall: string;
  orgId: string;
  projectId: string;
  isRepoProd: boolean;
  branchId: string;
}

function createInitialState(): NavState {
  return {
    avatarSmall: undefined,
    orgId: undefined,
    projectId: undefined,
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
}

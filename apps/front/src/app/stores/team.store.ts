import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class MemberExtended extends common.Member {
  fullName?: string;
}

export class TeamState {
  members: MemberExtended[];
}

function createInitialState(): TeamState {
  return { members: [] };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'project',
  resettable: true
})
export class TeamStore extends Store<TeamState> {
  constructor() {
    super(createInitialState());
  }
}

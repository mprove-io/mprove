import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class TeamState {
  members: common.Member[];
  total: number;
}

function createInitialState(): TeamState {
  return {
    members: [],
    total: 0
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'team',
  resettable: true
})
export class TeamStore extends Store<TeamState> {
  constructor() {
    super(createInitialState());
  }
}

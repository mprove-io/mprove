import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class ConnectionsState {
  connections: common.Connection[];
  total: number;
}

function createInitialState(): ConnectionsState {
  return {
    connections: [],
    total: 0
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'connections',
  resettable: true
})
export class ConnectionsStore extends Store<ConnectionsState> {
  constructor() {
    super(createInitialState());
  }
}

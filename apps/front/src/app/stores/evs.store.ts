import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class EvsState {
  evs: common.Ev[];
}

function createInitialState(): EvsState {
  return {
    evs: []
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'evs',
  resettable: true
})
export class EvsStore extends Store<EvsState> {
  constructor() {
    super(createInitialState());
  }
}

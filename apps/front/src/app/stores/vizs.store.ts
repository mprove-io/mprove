import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class VizsState {
  vizs: common.Viz[];
}

function createInitialState(): VizsState {
  return {
    vizs: []
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'vizs',
  resettable: true
})
export class VizsStore extends Store<VizsState> {
  constructor() {
    super(createInitialState());
  }
}

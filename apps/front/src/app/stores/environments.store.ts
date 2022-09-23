import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class EnvironmentsState {
  environments: common.Env[];
  total: number;
}

function createInitialState(): EnvironmentsState {
  return {
    environments: [],
    total: 0
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'environments',
  resettable: true
})
export class EnvironmentsStore extends Store<EnvironmentsState> {
  constructor() {
    super(createInitialState());
  }
}

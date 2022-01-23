import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class ModelsState {
  models: common.ModelX[];
}

function createInitialState(): ModelsState {
  return {
    models: []
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'models',
  resettable: true
})
export class ModelsStore extends Store<ModelsState> {
  constructor() {
    super(createInitialState());
  }
}

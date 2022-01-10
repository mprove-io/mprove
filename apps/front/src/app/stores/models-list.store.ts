import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class ModelsListState {
  allModelsList: common.ModelsItem[];
}

function createInitialState(): ModelsListState {
  return {
    allModelsList: []
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'modelsList',
  resettable: true
})
export class ModelsListStore extends Store<ModelsListState> {
  constructor() {
    super(createInitialState());
  }
}

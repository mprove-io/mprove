import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class VizsState {
  vizs: common.Viz[];
  modelsList: common.ModelsItem[];
  allModelsList: common.ModelsItem[];
}

function createInitialState(): VizsState {
  return {
    vizs: [],
    modelsList: [],
    allModelsList: []
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

import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class UiState {
  panel: common.PanelEnum;
  needSave: boolean;
}

function createInitialState(): UiState {
  return {
    panel: common.PanelEnum.Tree,
    needSave: false
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'ui',
  resettable: true
})
export class UiStore extends Store<UiState> {
  constructor() {
    super(createInitialState());
  }
}

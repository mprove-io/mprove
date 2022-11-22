import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export enum PanelEnum {
  Tree = 1,
  ChangesToCommit = 2,
  ChangesToPush = 3
}

export class UiState {
  panel: PanelEnum;
  needSave: boolean;
}

function createInitialState(): UiState {
  return {
    panel: PanelEnum.Tree,
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

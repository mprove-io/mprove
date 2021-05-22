import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export class UiState {
  openedMenuId: string;
  needSave: boolean;
}

function createInitialState(): UiState {
  return {
    openedMenuId: undefined,
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

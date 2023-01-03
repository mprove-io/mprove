import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class UiState {
  panel: common.PanelEnum;
  needSave: boolean;
}

let uiState: UiState = {
  panel: common.PanelEnum.Tree,
  needSave: false
};

@Injectable({ providedIn: 'root' })
export class UiQuery extends BaseQuery<UiState> {
  needSave$ = this.store.pipe(select(state => state.needSave));
  panel$ = this.store.pipe(select(state => state.panel));

  constructor() {
    super(createStore({ name: 'ui' }, withProps<UiState>(uiState)));
  }
}

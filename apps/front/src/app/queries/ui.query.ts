import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { IRowNode } from 'ag-grid-community';
import { common } from '~front/barrels/common';
import { RowData } from '../modules/metrics/rep/rep.component';
import { BaseQuery } from './base.query';

export class UiState {
  panel: common.PanelEnum;
  needSave: boolean;
  repSelectedNodes: IRowNode<RowData>[];
}

let uiState: UiState = {
  panel: common.PanelEnum.Tree,
  needSave: false,
  repSelectedNodes: []
};

@Injectable({ providedIn: 'root' })
export class UiQuery extends BaseQuery<UiState> {
  needSave$ = this.store.pipe(select(state => state.needSave));
  panel$ = this.store.pipe(select(state => state.panel));
  repSelectedNodes$ = this.store.pipe(select(state => state.repSelectedNodes));

  constructor() {
    super(createStore({ name: 'ui' }, withProps<UiState>(uiState)));
  }
}

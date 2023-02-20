import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { IRowNode } from 'ag-grid-community';
import { common } from '~front/barrels/common';
import { DataRow } from '../modules/metrics/rep/rep.component';
import { BaseQuery } from './base.query';

export class UiState {
  panel: common.PanelEnum;
  needSave: boolean;
  repSelectedNodes: IRowNode<DataRow>[];
  repChartData: {
    rows: DataRow[];
    columns: common.Column[];
  };
}

let uiState: UiState = {
  panel: common.PanelEnum.Tree,
  needSave: false,
  repSelectedNodes: [],
  repChartData: {
    rows: [],
    columns: []
  }
};

@Injectable({ providedIn: 'root' })
export class UiQuery extends BaseQuery<UiState> {
  needSave$ = this.store.pipe(select(state => state.needSave));
  panel$ = this.store.pipe(select(state => state.panel));
  repSelectedNodes$ = this.store.pipe(select(state => state.repSelectedNodes));
  repChartData$ = this.store.pipe(select(state => state.repChartData));

  constructor() {
    super(createStore({ name: 'ui' }, withProps<UiState>(uiState)));
  }
}

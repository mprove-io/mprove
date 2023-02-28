import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { GridApi, IRowNode } from 'ag-grid-community';
import { common } from '~front/barrels/common';
import { DataRow } from '../modules/metrics/rep/rep.component';
import { BaseQuery } from './base.query';

export class UiState {
  panel: common.PanelEnum;
  needSave: boolean;
  gridData: DataRow[];
  gridApi: GridApi<DataRow>;
  repChartData: {
    rows: DataRow[];
    columns: common.Column[];
  };
  repSelectedNodes: IRowNode<DataRow>[];
  showMetricsChart: boolean;
  showMetricsChartSettings: boolean;
  showChartForSelectedRow: boolean;
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFraction: common.Fraction;
}

let uiState: UiState = {
  needSave: false,
  panel: common.PanelEnum.Tree,
  gridData: [],
  gridApi: undefined,
  repChartData: {
    rows: [],
    columns: []
  },
  repSelectedNodes: [],
  showMetricsChart: undefined,
  showMetricsChartSettings: undefined,
  showChartForSelectedRow: undefined,
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined
};

@Injectable({ providedIn: 'root' })
export class UiQuery extends BaseQuery<UiState> {
  needSave$ = this.store.pipe(select(state => state.needSave));

  panel$ = this.store.pipe(select(state => state.panel));

  repSelectedNodes$ = this.store.pipe(select(state => state.repSelectedNodes));
  repChartData$ = this.store.pipe(select(state => state.repChartData));

  showMetricsChart$ = this.store.pipe(select(state => state.showMetricsChart));
  showMetricsChartSettings$ = this.store.pipe(
    select(state => state.showMetricsChartSettings)
  );

  constructor() {
    super(createStore({ name: 'ui' }, withProps<UiState>(uiState)));
  }
}

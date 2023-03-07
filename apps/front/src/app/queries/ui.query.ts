import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { GridApi, IRowNode } from 'ag-grid-community';
import { common } from '~front/barrels/common';
import { DataRow } from '../modules/metrics/rep/rep.component';
import { BaseQuery } from './base.query';

export interface RepChartData {
  rows: DataRow[];
  columns: common.Column[];
}

export class UiState {
  panel: common.PanelEnum;
  needSave: boolean;
  gridData: DataRow[];
  gridApi: GridApi<DataRow>;
  repChartData: RepChartData;
  repSelectedNodes: IRowNode<DataRow>[];
  metricsColumnNameWidth: number;
  metricsColumnParametersWidth: number;
  showMetricsModelName: boolean;
  showMetricsTimeFieldName: boolean;
  showMetricsChart: boolean;
  showMetricsChartSettings: boolean;
  showChartForSelectedRow: boolean;
  modelTreeLevels: common.ModelTreeLevelsEnum;
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
  metricsColumnNameWidth: undefined,
  metricsColumnParametersWidth: undefined,
  showMetricsModelName: undefined,
  showMetricsTimeFieldName: undefined,
  showMetricsChart: undefined,
  showMetricsChartSettings: undefined,
  showChartForSelectedRow: undefined,
  modelTreeLevels: undefined,
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined
};

@Injectable({ providedIn: 'root' })
export class UiQuery extends BaseQuery<UiState> {
  needSave$ = this.store.pipe(select(state => state.needSave));

  panel$ = this.store.pipe(select(state => state.panel));

  showMetricsModelName$ = this.store.pipe(
    select(state => state.showMetricsModelName)
  );

  showMetricsTimeFieldName$ = this.store.pipe(
    select(state => state.showMetricsTimeFieldName)
  );

  repSelectedNodes$ = this.store.pipe(select(state => state.repSelectedNodes));
  repChartData$ = this.store.pipe(select(state => state.repChartData));

  showMetricsChart$ = this.store.pipe(select(state => state.showMetricsChart));
  showMetricsChartSettings$ = this.store.pipe(
    select(state => state.showMetricsChartSettings)
  );

  modelTreeLevels$ = this.store.pipe(select(state => state.modelTreeLevels));

  constructor() {
    super(createStore({ name: 'ui' }, withProps<UiState>(uiState)));
  }
}

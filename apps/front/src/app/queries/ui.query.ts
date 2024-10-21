import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { GridApi, IRowNode } from 'ag-grid-community';
import equal from 'fast-deep-equal';
import { distinctUntilChanged, map } from 'rxjs/operators';
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
  metricsTimeColumnsNarrowWidth: number;
  metricsTimeColumnsWideWidth: number;
  showMetricsModelName: boolean;
  showMetricsTimeFieldName: boolean;
  showMetricsChart: boolean;
  showMetricsChartSettings: boolean;
  showChartForSelectedRows: boolean;
  modelTreeLevels: common.ModelTreeLevelsEnum;
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFraction: common.Fraction;
  showHours: boolean;
  showParametersJson: boolean;
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
  metricsTimeColumnsNarrowWidth: undefined,
  metricsTimeColumnsWideWidth: undefined,
  showMetricsModelName: undefined,
  showMetricsTimeFieldName: undefined,
  showMetricsChart: undefined,
  showMetricsChartSettings: undefined,
  showChartForSelectedRows: undefined,
  modelTreeLevels: undefined,
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined,
  showHours: undefined,
  showParametersJson: undefined
};

@Injectable({ providedIn: 'root' })
export class UiQuery extends BaseQuery<UiState> {
  needSave$ = this.store.pipe(select(state => state.needSave));

  timeColumnsNarrowWidth$ = this.store.pipe(
    select(state => state.metricsTimeColumnsNarrowWidth)
  );
  timeColumnsWideWidth$ = this.store.pipe(
    select(state => state.metricsTimeColumnsWideWidth)
  );

  panel$ = this.store.pipe(select(state => state.panel));

  showHours$ = this.store.pipe(select(state => state.showHours));

  showParametersJson$ = this.store.pipe(
    select(state => state.showParametersJson)
  );

  showMetricsModelName$ = this.store.pipe(
    select(state => state.showMetricsModelName)
  );

  showMetricsTimeFieldName$ = this.store.pipe(
    select(state => state.showMetricsTimeFieldName)
  );

  repSelectedNodes$ = this.store.pipe(select(state => state.repSelectedNodes));

  repSelectedRowIdsDistinct$ = this.store.pipe(
    map(x => x.repSelectedNodes.map(node => node.data.rowId)),
    distinctUntilChanged((prev, curr) => equal(prev, curr))
  );

  repChartData$ = this.store.pipe(select(state => state.repChartData));

  showMetricsChart$ = this.store.pipe(select(state => state.showMetricsChart));

  showChartForSelectedRows$ = this.store.pipe(
    select(state => state.showChartForSelectedRows)
  );

  showMetricsChartSettings$ = this.store.pipe(
    select(state => state.showMetricsChartSettings)
  );

  modelTreeLevels$ = this.store.pipe(select(state => state.modelTreeLevels));

  constructor() {
    super(createStore({ name: 'ui' }, withProps<UiState>(uiState)));
  }
}

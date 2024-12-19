import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { GridApi, IRowNode } from 'ag-grid-community';
import equal from 'fast-deep-equal';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { DataRow } from '~front/app/interfaces/data-row';
import { common } from '~front/barrels/common';
import { ChartFormulaData } from '../interfaces/chart-formula-data';
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
  chartFormulaData: ChartFormulaData;
  reportSelectedNodes: IRowNode<DataRow>[];
  metricsColumnNameWidth: number;
  metricsTimeColumnsNarrowWidth: number;
  metricsTimeColumnsWideWidth: number;
  showMetricsModelName: boolean;
  showMetricsTimeFieldName: boolean;
  showMetricsParameters: boolean;
  showParametersJson: boolean;
  showMetricsChart: boolean;
  showMetricsChartSettings: boolean;
  modelTreeLevels: common.ModelTreeLevelsEnum;
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFraction: common.Fraction;
  showHours: boolean;
  projectReportLinks: common.ProjectReportLink[];
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
  chartFormulaData: {
    eChartInitOpts: undefined,
    eChartOptions: undefined,
    dataPoints: undefined,
    newQueriesLength: undefined,
    runningQueriesLength: undefined
  },
  reportSelectedNodes: [],
  metricsColumnNameWidth: undefined,
  metricsTimeColumnsNarrowWidth: undefined,
  metricsTimeColumnsWideWidth: undefined,
  showMetricsModelName: undefined,
  showMetricsTimeFieldName: undefined,
  showMetricsParameters: undefined,
  showParametersJson: undefined,
  showMetricsChart: undefined,
  showMetricsChartSettings: undefined,
  modelTreeLevels: undefined,
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined,
  showHours: undefined,
  projectReportLinks: []
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

  projectReportLinks = this.store.pipe(
    select(state => state.projectReportLinks)
  );

  showMetricsModelName$ = this.store.pipe(
    select(state => state.showMetricsModelName)
  );

  showMetricsTimeFieldName$ = this.store.pipe(
    select(state => state.showMetricsTimeFieldName)
  );

  showMetricsParameters$ = this.store.pipe(
    select(state => state.showMetricsParameters)
  );

  showParametersJson$ = this.store.pipe(
    select(state => state.showParametersJson)
  );

  reportSelectedNodes$ = this.store.pipe(
    select(state => state.reportSelectedNodes)
  );

  reportSelectedRowIdsDistinct$ = this.store.pipe(
    map(x => x.reportSelectedNodes.map(node => node.data.rowId)),
    distinctUntilChanged((prev, curr) => equal(prev, curr))
  );

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

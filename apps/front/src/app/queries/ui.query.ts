import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { GridApi, IRowNode } from 'ag-grid-community';
import { DataRow } from '~front/app/interfaces/data-row';
import { common } from '~front/barrels/common';
import {
  DEFAULT_METRICS_COLUMN_NAME_WIDTH,
  DEFAULT_METRICS_TIME_COLUMNS_NARROW_WIDTH,
  DEFAULT_METRICS_TIME_COLUMNS_WIDE_WIDTH
} from '../constants/top';
import { ChartPointsData } from '../interfaces/chart-points-data';
import { BaseQuery } from './base.query';

export interface RepChartData {
  rows: DataRow[];
  columns: common.Column[];
  firstDataTimeColumnIndex: number;
  lastDataTimeColumnIndex: number;
}

export class UiState {
  isHighlighterReady: boolean;
  gridApi: GridApi<DataRow>;
  gridData: DataRow[];
  repChartData: RepChartData;
  chartPointsData: ChartPointsData;
  reportSelectedNodes: IRowNode<DataRow>[];
  metricsLoadedTs: number;
  showSchema: boolean;
  searchSchemaWord: string;
  searchMetricsWord: string;
  panel: common.PanelEnum;
  needSave: boolean;
  showTileParameters: boolean;
  showDashboardsLeftPanel: boolean;
  showMetricsChart: boolean;
  showMiniCharts: boolean;
  isAutoRun: boolean;
  showHours: boolean;
  showMetricsParameters: boolean;
  showMetricsModelName: boolean;
  showMetricsTimeFieldName: boolean;
  metricsColumnNameWidth: number;
  metricsTimeColumnsNarrowWidth: number;
  metricsTimeColumnsWideWidth: number;
  secondFileNodeId: string;
  //
  modelTreeLevels: common.ModelTreeLevelsEnum;
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFraction: common.Fraction;
  projectFileLinks: common.ProjectFileLink[];
  projectModelLinks: common.ProjectModelLink[];
  projectChartLinks: common.ProjectChartLink[];
  projectDashboardLinks: common.ProjectDashboardLink[];
  projectReportLinks: common.ProjectReportLink[];
}

let uiState: UiState = {
  isHighlighterReady: false,
  gridApi: undefined,
  gridData: [],
  repChartData: {
    rows: [],
    columns: [],
    firstDataTimeColumnIndex: -1,
    lastDataTimeColumnIndex: -1
  },
  chartPointsData: {
    dataPoints: undefined,
    newQueriesLength: undefined,
    runningQueriesLength: undefined
  },
  reportSelectedNodes: [],
  metricsLoadedTs: 0,
  showSchema: false,
  searchSchemaWord: undefined,
  searchMetricsWord: undefined,
  panel: common.PanelEnum.Tree,
  needSave: false,
  showTileParameters: false,
  showDashboardsLeftPanel: true,
  showMetricsChart: true,
  showMiniCharts: true,
  isAutoRun: true,
  showHours: false,
  showMetricsParameters: false,
  showMetricsModelName: false,
  showMetricsTimeFieldName: false,
  metricsColumnNameWidth: DEFAULT_METRICS_COLUMN_NAME_WIDTH,
  metricsTimeColumnsNarrowWidth: DEFAULT_METRICS_TIME_COLUMNS_NARROW_WIDTH,
  metricsTimeColumnsWideWidth: DEFAULT_METRICS_TIME_COLUMNS_WIDE_WIDTH,
  secondFileNodeId: undefined,
  //
  modelTreeLevels: undefined,
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined,
  projectFileLinks: [],
  projectModelLinks: [],
  projectChartLinks: [],
  projectDashboardLinks: [],
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

  showTileParameters$ = this.store.pipe(
    select(state => state.showTileParameters)
  );

  showDashboardsLeftPanel$ = this.store.pipe(
    select(state => state.showDashboardsLeftPanel)
  );

  showMiniCharts$ = this.store.pipe(select(state => state.showMiniCharts));

  showHours$ = this.store.pipe(select(state => state.showHours));

  isAutoRun$ = this.store.pipe(select(state => state.isAutoRun));

  showSchema$ = this.store.pipe(select(state => state.showSchema));

  projectFileLinks$ = this.store.pipe(select(state => state.projectFileLinks));

  projectModelLinks$ = this.store.pipe(
    select(state => state.projectModelLinks)
  );

  projectChartLinks$ = this.store.pipe(
    select(state => state.projectChartLinks)
  );

  projectDashboardLinks$ = this.store.pipe(
    select(state => state.projectDashboardLinks)
  );

  projectReportLinks$ = this.store.pipe(
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

  reportSelectedNodes$ = this.store.pipe(
    select(state => state.reportSelectedNodes)
  );

  repChartData$ = this.store.pipe(select(state => state.repChartData));

  showMetricsChart$ = this.store.pipe(select(state => state.showMetricsChart));

  modelTreeLevels$ = this.store.pipe(select(state => state.modelTreeLevels));

  searchSchemaWord$ = this.store.pipe(select(state => state.searchSchemaWord));

  searchMetricsWord$ = this.store.pipe(
    select(state => state.searchMetricsWord)
  );

  secondFileNodeId$ = this.store.pipe(select(state => state.secondFileNodeId));

  constructor() {
    super(createStore({ name: 'ui' }, withProps<UiState>(uiState)));
  }
}

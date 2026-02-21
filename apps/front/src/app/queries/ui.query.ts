import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { GridApi, IRowNode } from 'ag-grid-community';
import {
  DEFAULT_METRICS_COLUMN_NAME_WIDTH,
  DEFAULT_METRICS_TIME_COLUMNS_NARROW_WIDTH,
  DEFAULT_METRICS_TIME_COLUMNS_WIDE_WIDTH
} from '#common/constants/top-front';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { BuilderRightEnum } from '#common/enums/builder-right.enum';
import { ModelTreeLevelsEnum } from '#common/enums/model-tree-levels-enum.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ProjectChartLink } from '#common/interfaces/backend/project-chart-link';
import { ProjectDashboardLink } from '#common/interfaces/backend/project-dashboard-link';
import { ProjectModelLink } from '#common/interfaces/backend/project-model-link';
import { ProjectReportLink } from '#common/interfaces/backend/project-report-link';
import { ProjectSessionLink } from '#common/interfaces/backend/project-session-link';
import { Column } from '#common/interfaces/blockml/column';
import { Fraction } from '#common/interfaces/blockml/fraction';
import { ChartPointsData } from '#common/interfaces/front/chart-points-data';
import { DataRow } from '#common/interfaces/front/data-row';
import { BaseQuery } from './base.query';

export interface RepChartData {
  rows: DataRow[];
  columns: Column[];
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
  builderLeft: BuilderLeftEnum;
  builderRight: BuilderRightEnum;
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
  sessionDebugMode: boolean;
  isNavigatingSession: boolean;
  showSessionMessages: boolean;
  //
  modelTreeLevels: ModelTreeLevelsEnum;
  timezone: string;
  timeSpec: TimeSpecEnum;
  timeRangeFraction: Fraction;
  projectSessionLinks: ProjectSessionLink[];
  projectModelLinks: ProjectModelLink[];
  projectChartLinks: ProjectChartLink[];
  projectDashboardLinks: ProjectDashboardLink[];
  projectReportLinks: ProjectReportLink[];
  lastSelectedProviderModel: string;
  lastSelectedVariant: string;
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
  builderLeft: BuilderLeftEnum.Tree,
  builderRight: BuilderRightEnum.Sessions,
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
  sessionDebugMode: false,
  isNavigatingSession: false,
  showSessionMessages: true,
  //
  modelTreeLevels: undefined,
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined,
  projectSessionLinks: [],
  projectModelLinks: [],
  projectChartLinks: [],
  projectDashboardLinks: [],
  projectReportLinks: [],
  lastSelectedProviderModel: undefined,
  lastSelectedVariant: undefined
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

  builderLeft$ = this.store.pipe(select(state => state.builderLeft));

  builderRight$ = this.store.pipe(select(state => state.builderRight));

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

  projectSessionLinks$ = this.store.pipe(
    select(state => state.projectSessionLinks)
  );

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

  sessionDebugMode$ = this.store.pipe(select(state => state.sessionDebugMode));

  isNavigatingSession$ = this.store.pipe(
    select(state => state.isNavigatingSession)
  );

  showSessionMessages$ = this.store.pipe(
    select(state => state.showSessionMessages)
  );

  constructor() {
    super(createStore({ name: 'ui' }, withProps<UiState>(uiState)));
  }
}

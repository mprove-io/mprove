import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { GridApi, IRowNode } from 'ag-grid-community';
import {
  DEFAULT_METRICS_COLUMN_NAME_WIDTH,
  DEFAULT_METRICS_TIME_COLUMNS_NARROW_WIDTH,
  DEFAULT_METRICS_TIME_COLUMNS_WIDE_WIDTH
} from '#common/constants/top-front';
import { FilesRightPanelTabEnum } from '#common/enums/files-right-panel-tab.enum';
import { ModelTreeLevelsEnum } from '#common/enums/model-tree-levels-enum.enum';
import { PanelEnum } from '#common/enums/panel.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ProjectChartLink } from '#common/interfaces/backend/project-chart-link';
import { ProjectDashboardLink } from '#common/interfaces/backend/project-dashboard-link';
import { ProjectFileLink } from '#common/interfaces/backend/project-file-link';
import { ProjectModelLink } from '#common/interfaces/backend/project-model-link';
import { ProjectReportLink } from '#common/interfaces/backend/project-report-link';
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
  panel: PanelEnum;
  needSave: boolean;
  showTileParameters: boolean;
  showDashboardsLeftPanel: boolean;
  showFilesLeftPanel: boolean;
  showFilesRightPanel: boolean;
  filesRightPanelTab: FilesRightPanelTabEnum;
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
  modelTreeLevels: ModelTreeLevelsEnum;
  timezone: string;
  timeSpec: TimeSpecEnum;
  timeRangeFraction: Fraction;
  projectFileLinks: ProjectFileLink[];
  projectModelLinks: ProjectModelLink[];
  projectChartLinks: ProjectChartLink[];
  projectDashboardLinks: ProjectDashboardLink[];
  projectReportLinks: ProjectReportLink[];
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
  panel: PanelEnum.Tree,
  needSave: false,
  showTileParameters: false,
  showDashboardsLeftPanel: true,
  showFilesLeftPanel: true,
  showFilesRightPanel: true,
  filesRightPanelTab: FilesRightPanelTabEnum.Sessions,
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

  showFilesLeftPanel$ = this.store.pipe(
    select(state => state.showFilesLeftPanel)
  );

  showFilesRightPanel$ = this.store.pipe(
    select(state => state.showFilesRightPanel)
  );

  filesRightPanelTab$ = this.store.pipe(
    select(state => state.filesRightPanelTab)
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

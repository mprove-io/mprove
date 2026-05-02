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
import type { ProjectChartLink } from '#common/zod/backend/project-chart-link';
import type { ProjectDashboardLink } from '#common/zod/backend/project-dashboard-link';
import type { ProjectExplorerSessionLink } from '#common/zod/backend/project-explorer-session-link';
import type { ProjectModelLink } from '#common/zod/backend/project-model-link';
import type { ProjectReportLink } from '#common/zod/backend/project-report-link';
import type { Column } from '#common/zod/blockml/column';
import type { Fraction } from '#common/zod/blockml/fraction';
import type { ChartPointsData } from '#common/zod/front/chart-points-data';
import type { DataRow } from '#common/zod/front/data-row';
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
  sessionShowEvents: boolean;
  sessionToggleAllEvents: number;
  sessionAllEventsExpanded: boolean;
  isNavigatingSession: boolean;
  showContent: boolean;
  showSessionInput: boolean;
  //
  modelTreeLevels: ModelTreeLevelsEnum;
  timezone: string;
  timeSpec: TimeSpecEnum;
  timeRangeFraction: Fraction;
  projectModelLinks: ProjectModelLink[];
  projectChartLinks: ProjectChartLink[];
  projectDashboardLinks: ProjectDashboardLink[];
  projectExplorerSessionLinks: ProjectExplorerSessionLink[];
  projectReportLinks: ProjectReportLink[];
  permissionsAutoAcceptSessionIds: string[];
  isOptimisticLoading: boolean;
  newSessionPermissionsAutoAccept: boolean;
  newSessionExplorerProviderModel: string;
  newSessionEditorProviderModel: string;
  newSessionEditorVariant: string;
  newSessionUseCodex: boolean;
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
  builderRight: BuilderRightEnum.Validation,
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
  sessionShowEvents: false,
  sessionToggleAllEvents: 0,
  sessionAllEventsExpanded: false,
  isNavigatingSession: false,
  showContent: true,
  showSessionInput: true,
  isOptimisticLoading: false,
  //
  modelTreeLevels: undefined,
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined,
  projectModelLinks: [],
  projectChartLinks: [],
  projectDashboardLinks: [],
  projectExplorerSessionLinks: [],
  projectReportLinks: [],
  permissionsAutoAcceptSessionIds: [],
  newSessionPermissionsAutoAccept: false,
  newSessionExplorerProviderModel: undefined,
  newSessionEditorProviderModel: undefined,
  newSessionEditorVariant: undefined,
  newSessionUseCodex: true
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

  projectModelLinks$ = this.store.pipe(
    select(state => state.projectModelLinks)
  );

  projectChartLinks$ = this.store.pipe(
    select(state => state.projectChartLinks)
  );

  projectDashboardLinks$ = this.store.pipe(
    select(state => state.projectDashboardLinks)
  );

  projectExplorerSessionLinks$ = this.store.pipe(
    select(state => state.projectExplorerSessionLinks)
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

  sessionShowEvents$ = this.store.pipe(
    select(state => state.sessionShowEvents)
  );

  sessionToggleAllEvents$ = this.store.pipe(
    select(state => state.sessionToggleAllEvents)
  );

  sessionAllEventsExpanded$ = this.store.pipe(
    select(state => state.sessionAllEventsExpanded)
  );

  isNavigatingSession$ = this.store.pipe(
    select(state => state.isNavigatingSession)
  );

  showContent$ = this.store.pipe(select(state => state.showContent));

  showSessionInput$ = this.store.pipe(select(state => state.showSessionInput));

  permissionsAutoAcceptSessionIds$ = this.store.pipe(
    select(state => state.permissionsAutoAcceptSessionIds)
  );

  isOptimisticLoading$ = this.store.pipe(
    select(state => state.isOptimisticLoading)
  );

  newSessionPermissionsAutoAccept$ = this.store.pipe(
    select(state => state.newSessionPermissionsAutoAccept)
  );

  newSessionExplorerProviderModel$ = this.store.pipe(
    select(state => state.newSessionExplorerProviderModel)
  );

  newSessionEditorProviderModel$ = this.store.pipe(
    select(state => state.newSessionEditorProviderModel)
  );

  newSessionEditorVariant$ = this.store.pipe(
    select(state => state.newSessionEditorVariant)
  );

  newSessionUseCodex$ = this.store.pipe(
    select(state => state.newSessionUseCodex)
  );

  constructor() {
    super(createStore({ name: 'ui' }, withProps<UiState>(uiState)));
  }
}

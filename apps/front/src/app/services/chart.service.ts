import { Injectable } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { EMPTY_CHART_ID } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { QueryOperation } from '#common/types/backend/parts/query-operation/query-operation';
import type { ToBackendCreateDraftChartOutput } from '#common/types/backend/routes/charts/create-draft-chart/create-draft-chart-output';
import type { ToBackendCreateDraftChartRequest } from '#common/types/backend/routes/charts/create-draft-chart/create-draft-chart-request';
import type { ToBackendDeleteDraftChartsOutput } from '#common/types/backend/routes/charts/delete-draft-charts/delete-draft-charts-output';
import type { ToBackendDeleteDraftChartsRequest } from '#common/types/backend/routes/charts/delete-draft-charts/delete-draft-charts-request';
import type { ToBackendEditDraftChartOutput } from '#common/types/backend/routes/charts/edit-draft-chart/edit-draft-chart-output';
import type { ToBackendEditDraftChartRequest } from '#common/types/backend/routes/charts/edit-draft-chart/edit-draft-chart-request';
import { ChartQuery } from '../queries/chart.query';
import { ChartsQuery } from '../queries/charts.query';
import { ModelQuery } from '../queries/model.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ApiService } from './api.service';
import { NavigateService } from './navigate.service';
import { SpinnerService } from './spinner.service';

@Injectable({ providedIn: 'root' })
export class ChartService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  constructor(
    private spinnerService: SpinnerService,
    private apiService: ApiService,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private chartsQuery: ChartsQuery,
    private chartQuery: ChartQuery,
    private modelQuery: ModelQuery
  ) {
    this.nav$.subscribe();
  }

  editChart(item: {
    isKeepQueryId?: boolean;
    mconfig: MconfigX;
    isDraft: boolean;
    chartId: string;
    cellMetricsStartDateMs?: number;
    cellMetricsEndDateMs?: number;
    queryOperation?: QueryOperation;
  }) {
    let {
      isKeepQueryId,
      mconfig,
      isDraft,
      chartId,
      cellMetricsStartDateMs,
      cellMetricsEndDateMs,
      queryOperation
    } = item;

    if (isDraft === true) {
      this.editDraftChart({
        mconfig: mconfig,
        chartId: chartId,
        queryOperation: queryOperation
      });
    } else {
      this.navCreateDraftChart({
        mconfig: mconfig,
        isKeepQueryId: isKeepQueryId,
        cellMetricsStartDateMs: cellMetricsStartDateMs,
        cellMetricsEndDateMs: cellMetricsEndDateMs,
        queryOperation: queryOperation
      });
    }
  }

  navCreateDraftChart(item: {
    mconfig: MconfigX;
    isKeepQueryId: boolean;
    cellMetricsStartDateMs: number;
    cellMetricsEndDateMs: number;
    queryOperation: QueryOperation;
  }) {
    let {
      mconfig,
      isKeepQueryId,
      cellMetricsStartDateMs,
      cellMetricsEndDateMs,
      queryOperation
    } = item;

    let payload: ToBackendCreateDraftChartRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      mconfig: mconfig,
      isKeepQueryId: isKeepQueryId,
      cellMetricsStartDateMs: cellMetricsStartDateMs,
      cellMetricsEndDateMs: cellMetricsEndDateMs,
      queryOperation: queryOperation
    };

    this.apiService
      .req({
        route: 'api/ToBackendCreateDraftChart',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendCreateDraftChartOutput = resp.output;

          let chart = output.chart;

          let chartsState = this.chartsQuery.getValue();

          this.chartsQuery.update({
            chartUnitDrafts: output.chartUnitDrafts,
            chartSpaceNodes: chartsState.chartSpaceNodes
          });

          this.navigateService.navigateToChart({
            modelId: chart.modelId,
            chartId: chart.chartId
          });
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  editDraftChart(item: {
    chartId: string;
    mconfig: MconfigX;
    queryOperation: QueryOperation;
  }) {
    let { chartId, mconfig, queryOperation } = item;

    let payload: ToBackendEditDraftChartRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      chartId: chartId,
      mconfig: mconfig,
      queryOperation: queryOperation
    };

    this.apiService
      .req({
        route: 'api/ToBackendEditDraftChart',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendEditDraftChartOutput = resp.output;

          let chart = output.chart;

          let chartsState = this.chartsQuery.getValue();

          this.chartQuery.update(chart);

          this.chartsQuery.update({
            chartUnitDrafts: output.chartUnitDrafts,
            chartSpaceNodes: chartsState.chartSpaceNodes
          });
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  deleteDraftCharts(item: { chartIds: string[] }) {
    let { chartIds } = item;

    let payload: ToBackendDeleteDraftChartsRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      chartIds: chartIds
    };

    this.apiService
      .req({
        route: 'api/ToBackendDeleteDraftCharts',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendDeleteDraftChartsOutput = resp.output;

          let chartsState = this.chartsQuery.getValue();

          this.chartsQuery.update({
            chartUnitDrafts: output.chartUnitDrafts,
            chartSpaceNodes: chartsState.chartSpaceNodes
          });

          let chart = this.chartQuery.getValue();

          if (chartIds.indexOf(chart.chartId) > -1) {
            let model = this.modelQuery.getValue();

            if (isDefined(model.modelId)) {
              this.navigateService.navigateToChart({
                modelId: model.modelId,
                chartId: EMPTY_CHART_ID
              });
            } else {
              this.navigateService.navigateToModels();
            }
          }
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }
}

import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { EMPTY_CHART_ID } from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { QueryOperation } from '#common/types/backend/parts/query-operation/query-operation';
import type { ToBackendCreateDraftChartRequest } from '#common/types/backend/routes/charts/create-draft-chart/create-draft-chart-request';
import type { ToBackendCreateDraftChartResponse } from '#common/types/backend/routes/charts/create-draft-chart/create-draft-chart-response';
import type { ToBackendDeleteDraftChartsRequest } from '#common/types/backend/routes/charts/delete-draft-charts/delete-draft-charts-request';
import type { ToBackendDeleteDraftChartsResponse } from '#common/types/backend/routes/charts/delete-draft-charts/delete-draft-charts-response';
import type { ToBackendEditDraftChartRequest } from '#common/types/backend/routes/charts/edit-draft-chart/edit-draft-chart-request';
import type { ToBackendEditDraftChartResponse } from '#common/types/backend/routes/charts/edit-draft-chart/edit-draft-chart-response';
import { ChartQuery } from '../queries/chart.query';
import { ChartsQuery } from '../queries/charts.query';
import { ModelQuery } from '../queries/model.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ApiService } from './api.service';
import { NavigateService } from './navigate.service';

@Injectable({ providedIn: 'root' })
export class ChartService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  constructor(
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
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
    this.spinner.show(APP_SPINNER_NAME);

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
        tap((resp: ToBackendCreateDraftChartResponse) => {
          if (resp?.type === 'Success') {
            let chart = resp.output.chart;

            let chartsState = this.chartsQuery.getValue();

            this.chartsQuery.update({
              chartUnitDrafts: resp.output.chartUnitDrafts,
              chartSpaceNodes: chartsState.chartSpaceNodes
            });

            this.navigateService.navigateToChart({
              modelId: chart.modelId,
              chartId: chart.chartId
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  editDraftChart(item: {
    chartId: string;
    mconfig: MconfigX;
    queryOperation: QueryOperation;
  }) {
    this.spinner.show(APP_SPINNER_NAME);

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
        tap((resp: ToBackendEditDraftChartResponse) => {
          this.spinner.hide(APP_SPINNER_NAME);

          if (resp?.type === 'Success') {
            let chart = resp.output.chart;

            let chartsState = this.chartsQuery.getValue();

            this.chartQuery.update(chart);

            this.chartsQuery.update({
              chartUnitDrafts: resp.output.chartUnitDrafts,
              chartSpaceNodes: chartsState.chartSpaceNodes
            });
          }
        }),
        take(1)
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
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteDraftChartsResponse) => {
          if (resp?.type === 'Success') {
            let chartsState = this.chartsQuery.getValue();

            this.chartsQuery.update({
              chartUnitDrafts: resp.output.chartUnitDrafts,
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
          }
        }),
        take(1)
      )
      .subscribe();
  }
}

import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { EMPTY_CHART_ID } from '~common/constants/top';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { QueryOperation } from '~common/interfaces/backend/query-operation';
import {
  ToBackendCreateDraftChartRequestPayload,
  ToBackendCreateDraftChartResponse
} from '~common/interfaces/to-backend/charts/to-backend-create-draft-chart';
import {
  ToBackendDeleteDraftChartsRequestPayload,
  ToBackendDeleteDraftChartsResponse
} from '~common/interfaces/to-backend/charts/to-backend-delete-draft-charts';
import {
  ToBackendEditDraftChartRequestPayload,
  ToBackendEditDraftChartResponse
} from '~common/interfaces/to-backend/charts/to-backend-edit-draft-chart';
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
    isDraft: boolean;
    mconfig: MconfigX;
    // isKeepQueryId?: boolean;
    chartId: string;
    cellMetricsStartDateMs?: number;
    cellMetricsEndDateMs?: number;
    queryOperation?: QueryOperation;
  }) {
    let {
      isDraft,
      mconfig,
      // isKeepQueryId,
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
        // isKeepQueryId: isKeepQueryId,
        cellMetricsStartDateMs: cellMetricsStartDateMs,
        cellMetricsEndDateMs: cellMetricsEndDateMs,
        queryOperation: queryOperation
      });
    }
  }

  navCreateDraftChart(item: {
    mconfig: MconfigX;
    // isKeepQueryId: boolean;
    cellMetricsStartDateMs: number;
    cellMetricsEndDateMs: number;
    queryOperation: QueryOperation;
  }) {
    this.spinner.show(APP_SPINNER_NAME);

    let {
      mconfig,
      // isKeepQueryId,
      cellMetricsStartDateMs,
      cellMetricsEndDateMs,
      queryOperation
    } = item;

    let payload: ToBackendCreateDraftChartRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      mconfig: mconfig,
      // isKeepQueryId: isKeepQueryId,
      cellMetricsStartDateMs: cellMetricsStartDateMs,
      cellMetricsEndDateMs: cellMetricsEndDateMs,
      queryOperation: queryOperation
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateDraftChart,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCreateDraftChartResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let chart = resp.payload.chart;

            let charts = this.chartsQuery.getValue().charts;
            let newCharts = [chart, ...charts];

            this.chartsQuery.update({ charts: newCharts });

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

    let payload: ToBackendEditDraftChartRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      chartId: chartId,
      mconfig: mconfig,
      queryOperation: queryOperation
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditDraftChart,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendEditDraftChartResponse) => {
          this.spinner.hide(APP_SPINNER_NAME);

          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.chartQuery.update(resp.payload.chart);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteDraftCharts(item: { chartIds: string[] }) {
    let { chartIds } = item;

    let payload: ToBackendDeleteDraftChartsRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      chartIds: chartIds
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteDraftCharts,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteDraftChartsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let charts = this.chartsQuery.getValue().charts;

            this.chartsQuery.update({
              charts: charts.filter(x => chartIds.indexOf(x.chartId) < 0)
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

import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { ChartQuery } from '../queries/chart.query';
import { ChartsQuery } from '../queries/charts.query';
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
    private chartQuery: ChartQuery
  ) {
    this.nav$.subscribe();
  }

  editChart(item: {
    isDraft: boolean;
    mconfig: common.MconfigX;
    chartId: string;
  }) {
    let { isDraft, mconfig, chartId } = item;

    if (isDraft === true) {
      this.editDraftChart({
        mconfig: mconfig,
        chartId: chartId
      });
    } else {
      this.navCreateDraftChart({
        mconfig: mconfig
      });
    }
  }

  navCreateDraftChart(item: { mconfig: common.MconfigX }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { mconfig } = item;

    let payload: apiToBackend.ToBackendCreateDraftChartRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      mconfig: mconfig
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDraftChart,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateDraftChartResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
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

  editDraftChart(item: { chartId: string; mconfig: common.MconfigX }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { chartId, mconfig } = item;

    let payload: apiToBackend.ToBackendEditDraftChartRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      chartId: chartId,
      mconfig: mconfig
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditDraftChart,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditDraftChartResponse) => {
          this.spinner.hide(constants.APP_SPINNER_NAME);

          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.chartQuery.update(resp.payload.chart);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteDraftCharts(item: { chartIds: string[] }) {
    let { chartIds } = item;

    let payload: apiToBackend.ToBackendDeleteDraftChartsRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      chartIds: chartIds
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteDraftCharts,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteDraftChartsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let charts = this.chartsQuery.getValue().charts;

            this.chartsQuery.update({
              charts: charts.filter(x => chartIds.indexOf(x.chartId) < 0)
            });

            let chart = this.chartQuery.getValue();

            if (chartIds.indexOf(chart.chartId) > -1) {
              this.navigateService.navigateToCharts();
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }
}

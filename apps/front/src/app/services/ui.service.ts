import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { UiQuery } from '../queries/ui.query';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UiService {
  constructor(
    private apiService: ApiService,
    private uiQuery: UiQuery,
    private spinner: NgxSpinnerService
  ) {}

  async setUserUi(item: {
    showMetricsChart?: boolean;
    showMetricsChartSettings?: boolean;
    showChartForSelectedRow?: boolean;
  }) {
    let {
      showMetricsChart,
      showMetricsChartSettings,
      showChartForSelectedRow
    } = item;

    let uiState = this.uiQuery.getValue();

    let ui: common.Ui = {
      showMetricsChart: common.isDefined(showMetricsChart)
        ? showMetricsChart
        : uiState.showMetricsChart,
      showMetricsChartSettings: common.isDefined(showMetricsChartSettings)
        ? showMetricsChartSettings
        : uiState.showMetricsChartSettings,
      showChartForSelectedRow: common.isDefined(showChartForSelectedRow)
        ? showChartForSelectedRow
        : uiState.showChartForSelectedRow,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFraction: uiState.timeRangeFraction
    };

    let payload: apiToBackend.ToBackendSetUserUiRequestPayload = {
      ui: ui
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserUi,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendSetUserUiResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
          }
        }),
        take(1)
      )
      .subscribe();
  }
}

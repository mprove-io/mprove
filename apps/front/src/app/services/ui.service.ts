import { Injectable } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { UiQuery } from '../queries/ui.query';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UiService {
  constructor(private apiService: ApiService, private uiQuery: UiQuery) {}

  async setUserUi(item: {
    metricsColumnNameWidth?: number;
    metricsColumnParametersWidth?: number;
    showMetricsModelName?: boolean;
    showMetricsTimeFieldName?: boolean;
    showMetricsChart?: boolean;
    showMetricsChartSettings?: boolean;
    showChartForSelectedRow?: boolean;
    modelTreeLevels?: common.ModelTreeLevelsEnum;
  }) {
    let {
      metricsColumnNameWidth,
      metricsColumnParametersWidth,
      showMetricsModelName,
      showMetricsTimeFieldName,
      showMetricsChart,
      showMetricsChartSettings,
      showChartForSelectedRow,
      modelTreeLevels
    } = item;

    let uiState = this.uiQuery.getValue();

    let ui: common.Ui = {
      metricsColumnNameWidth: common.isDefined(metricsColumnNameWidth)
        ? metricsColumnNameWidth
        : uiState.metricsColumnNameWidth,
      metricsColumnParametersWidth: common.isDefined(
        metricsColumnParametersWidth
      )
        ? metricsColumnParametersWidth
        : uiState.metricsColumnParametersWidth,
      showMetricsModelName: common.isDefined(showMetricsModelName)
        ? showMetricsModelName
        : uiState.showMetricsModelName,
      showMetricsTimeFieldName: common.isDefined(showMetricsTimeFieldName)
        ? showMetricsTimeFieldName
        : uiState.showMetricsTimeFieldName,
      showMetricsChart: common.isDefined(showMetricsChart)
        ? showMetricsChart
        : uiState.showMetricsChart,
      showMetricsChartSettings: common.isDefined(showMetricsChartSettings)
        ? showMetricsChartSettings
        : uiState.showMetricsChartSettings,
      showChartForSelectedRow: common.isDefined(showChartForSelectedRow)
        ? showChartForSelectedRow
        : uiState.showChartForSelectedRow,
      modelTreeLevels: common.isDefined(modelTreeLevels)
        ? modelTreeLevels
        : uiState.modelTreeLevels,
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

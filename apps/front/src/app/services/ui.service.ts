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
    metricsTimeColumnsNarrowWidth?: number;
    metricsTimeColumnsWideWidth?: number;
    showMetricsModelName?: boolean;
    showMetricsTimeFieldName?: boolean;
    showMetricsParameters?: boolean;
    showMetricsChart?: boolean;
    showMetricsChartSettings?: boolean;
    modelTreeLevels?: common.ModelTreeLevelsEnum;
    showHours?: boolean;
    isAutoRun?: boolean;
    projectFileLinks?: common.ProjectFileLink[];
    projectModelLinks?: common.ProjectModelLink[];
    projectChartLinks?: common.ProjectChartLink[];
    projectDashboardLinks?: common.ProjectDashboardLink[];
    projectReportLinks?: common.ProjectReportLink[];
    timezone?: string;
  }) {
    let {
      metricsColumnNameWidth,
      metricsTimeColumnsNarrowWidth,
      metricsTimeColumnsWideWidth,
      showMetricsModelName,
      showMetricsTimeFieldName,
      showMetricsParameters,
      showMetricsChart,
      showMetricsChartSettings,
      modelTreeLevels,
      showHours,
      isAutoRun,
      projectFileLinks,
      projectModelLinks,
      projectChartLinks,
      projectDashboardLinks,
      projectReportLinks,
      timezone
    } = item;

    let uiState = this.uiQuery.getValue();

    let ui: common.Ui = {
      metricsColumnNameWidth: common.isDefined(metricsColumnNameWidth)
        ? metricsColumnNameWidth
        : uiState.metricsColumnNameWidth,
      metricsTimeColumnsNarrowWidth: common.isDefined(
        metricsTimeColumnsNarrowWidth
      )
        ? metricsTimeColumnsNarrowWidth
        : uiState.metricsTimeColumnsNarrowWidth,
      metricsTimeColumnsWideWidth: common.isDefined(metricsTimeColumnsWideWidth)
        ? metricsTimeColumnsWideWidth
        : uiState.metricsTimeColumnsWideWidth,
      showMetricsModelName: common.isDefined(showMetricsModelName)
        ? showMetricsModelName
        : uiState.showMetricsModelName,
      showMetricsTimeFieldName: common.isDefined(showMetricsTimeFieldName)
        ? showMetricsTimeFieldName
        : uiState.showMetricsTimeFieldName,
      showMetricsParameters: common.isDefined(showMetricsParameters)
        ? showMetricsParameters
        : uiState.showMetricsParameters,
      showMetricsChart: common.isDefined(showMetricsChart)
        ? showMetricsChart
        : uiState.showMetricsChart,
      showMetricsChartSettings: common.isDefined(showMetricsChartSettings)
        ? showMetricsChartSettings
        : uiState.showMetricsChartSettings,
      modelTreeLevels: common.isDefined(modelTreeLevels)
        ? modelTreeLevels
        : uiState.modelTreeLevels,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFraction: uiState.timeRangeFraction,
      showHours: common.isDefined(showHours) ? showHours : uiState.showHours,
      isAutoRun: common.isDefined(isAutoRun) ? isAutoRun : uiState.isAutoRun,
      projectFileLinks: common.isDefined(projectFileLinks)
        ? projectFileLinks
        : uiState.projectFileLinks,
      projectModelLinks: common.isDefined(projectModelLinks)
        ? projectModelLinks
        : uiState.projectModelLinks,
      projectChartLinks: common.isDefined(projectChartLinks)
        ? projectChartLinks
        : uiState.projectChartLinks,
      projectDashboardLinks: common.isDefined(projectDashboardLinks)
        ? projectDashboardLinks
        : uiState.projectDashboardLinks,
      projectReportLinks: common.isDefined(projectReportLinks)
        ? projectReportLinks
        : uiState.projectReportLinks
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

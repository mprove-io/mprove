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
    timezone?: string;
    modelTreeLevels?: common.ModelTreeLevelsEnum;
    projectFileLinks?: common.ProjectFileLink[];
    projectModelLinks?: common.ProjectModelLink[];
    projectChartLinks?: common.ProjectChartLink[];
    projectDashboardLinks?: common.ProjectDashboardLink[];
    projectReportLinks?: common.ProjectReportLink[];
  }) {
    let {
      timezone,
      modelTreeLevels,
      projectFileLinks,
      projectModelLinks,
      projectChartLinks,
      projectDashboardLinks,
      projectReportLinks
    } = item;

    let uiState = this.uiQuery.getValue();

    let ui: common.Ui = {
      modelTreeLevels: common.isDefined(modelTreeLevels)
        ? modelTreeLevels
        : uiState.modelTreeLevels,
      timezone: common.isDefined(timezone) ? timezone : uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFraction: uiState.timeRangeFraction,
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

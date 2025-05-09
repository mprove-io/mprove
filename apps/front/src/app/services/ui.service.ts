import { Injectable } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { FileQuery } from '../queries/file.query';
import { NavQuery } from '../queries/nav.query';
import { UiQuery } from '../queries/ui.query';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UiService {
  constructor(
    private apiService: ApiService,
    private uiQuery: UiQuery,
    private fileQuery: FileQuery,
    private navQuery: NavQuery
  ) {}

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

  setProjectFileLink() {
    let fileId = this.fileQuery.getValue().fileId;
    let secondFileNodeId = this.uiQuery.getValue().secondFileNodeId;

    let projectId = this.navQuery.getValue().projectId;
    let links = this.uiQuery.getValue().projectFileLinks;

    let link: common.ProjectFileLink = links.find(
      l => l.projectId === projectId
    );

    let newProjectFileLinks: common.ProjectFileLink[];

    if (common.isDefined(link)) {
      let newLink: common.ProjectFileLink = {
        projectId: projectId,
        fileId: common.isDefined(fileId) ? fileId : link.fileId,
        secondFileNodeId: secondFileNodeId,
        lastNavTs: Date.now()
      };

      newProjectFileLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === projectId))
      ];
    } else {
      let newLink: common.ProjectFileLink = {
        projectId: projectId,
        fileId: fileId,
        secondFileNodeId: secondFileNodeId,
        lastNavTs: Date.now()
      };

      newProjectFileLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectFileLinks = newProjectFileLinks.filter(
      l => l.lastNavTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({ projectFileLinks: newProjectFileLinks });
    this.setUserUi({ projectFileLinks: newProjectFileLinks });
  }
}

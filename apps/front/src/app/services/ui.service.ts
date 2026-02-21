import { Injectable } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { ModelTreeLevelsEnum } from '#common/enums/model-tree-levels-enum.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ProjectChartLink } from '#common/interfaces/backend/project-chart-link';
import { ProjectDashboardLink } from '#common/interfaces/backend/project-dashboard-link';
import { ProjectModelLink } from '#common/interfaces/backend/project-model-link';
import { ProjectReportLink } from '#common/interfaces/backend/project-report-link';
import { ProjectSessionLink } from '#common/interfaces/backend/project-session-link';
import { Ui } from '#common/interfaces/backend/ui';
import {
  ToBackendSetUserUiRequestPayload,
  ToBackendSetUserUiResponse
} from '#common/interfaces/to-backend/users/to-backend-set-user-ui';
import { NavQuery } from '../queries/nav.query';
import { UiQuery } from '../queries/ui.query';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UiService {
  constructor(
    private apiService: ApiService,
    private uiQuery: UiQuery,
    private navQuery: NavQuery
  ) {}

  async setUserUi(item: {
    timezone?: string;
    modelTreeLevels?: ModelTreeLevelsEnum;
    projectSessionLinks?: ProjectSessionLink[];
    projectModelLinks?: ProjectModelLink[];
    projectChartLinks?: ProjectChartLink[];
    projectDashboardLinks?: ProjectDashboardLink[];
    projectReportLinks?: ProjectReportLink[];
    lastSelectedProviderModel?: string;
    lastSelectedVariant?: string;
  }) {
    let {
      timezone,
      modelTreeLevels,
      projectSessionLinks,
      projectModelLinks,
      projectChartLinks,
      projectDashboardLinks,
      projectReportLinks,
      lastSelectedProviderModel,
      lastSelectedVariant
    } = item;

    let uiState = this.uiQuery.getValue();

    let ui: Ui = {
      modelTreeLevels: isDefined(modelTreeLevels)
        ? modelTreeLevels
        : uiState.modelTreeLevels,
      timezone: isDefined(timezone) ? timezone : uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFraction: uiState.timeRangeFraction,
      projectSessionLinks: isDefined(projectSessionLinks)
        ? projectSessionLinks
        : uiState.projectSessionLinks,
      projectModelLinks: isDefined(projectModelLinks)
        ? projectModelLinks
        : uiState.projectModelLinks,
      projectChartLinks: isDefined(projectChartLinks)
        ? projectChartLinks
        : uiState.projectChartLinks,
      projectDashboardLinks: isDefined(projectDashboardLinks)
        ? projectDashboardLinks
        : uiState.projectDashboardLinks,
      projectReportLinks: isDefined(projectReportLinks)
        ? projectReportLinks
        : uiState.projectReportLinks,
      lastSelectedProviderModel: isDefined(lastSelectedProviderModel)
        ? lastSelectedProviderModel
        : uiState.lastSelectedProviderModel,
      lastSelectedVariant: isDefined(lastSelectedVariant)
        ? lastSelectedVariant
        : uiState.lastSelectedVariant
    };

    let payload: ToBackendSetUserUiRequestPayload = {
      ui: ui
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSetUserUi,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSetUserUiResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
          }
        }),
        take(1)
      )
      .subscribe();
  }

  clearProjectSessionLink() {
    let projectId = this.navQuery.getValue().projectId;

    if (isUndefined(projectId)) {
      return;
    }

    let links = this.uiQuery.getValue().projectSessionLinks;

    let link: ProjectSessionLink = links.find(l => l.projectId === projectId);

    if (isUndefined(link)) {
      return;
    }

    let newProjectSessionLinks = links.filter(l => l.projectId !== projectId);

    this.uiQuery.updatePart({ projectSessionLinks: newProjectSessionLinks });
    this.setUserUi({ projectSessionLinks: newProjectSessionLinks });
  }

  setProjectSessionLink(item: { sessionId: string }) {
    let { sessionId } = item;

    let projectId = this.navQuery.getValue().projectId;

    if (isUndefined(projectId) || isUndefined(sessionId)) {
      return;
    }

    let links = this.uiQuery.getValue().projectSessionLinks;

    let link: ProjectSessionLink = links.find(l => l.projectId === projectId);

    if (link?.sessionId === sessionId) {
      return;
    }

    let newLink: ProjectSessionLink = {
      projectId: projectId,
      sessionId: sessionId,
      navTs: Date.now()
    };

    let newProjectSessionLinks: ProjectSessionLink[];

    if (isDefined(link)) {
      newProjectSessionLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === projectId))
      ];
    } else {
      newProjectSessionLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectSessionLinks = newProjectSessionLinks.filter(
      l => l.navTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({ projectSessionLinks: newProjectSessionLinks });
    this.setUserUi({ projectSessionLinks: newProjectSessionLinks });
  }

  setProjectChartLink(item: { chartId: string }) {
    let { chartId } = item;

    let nav = this.navQuery.getValue();

    if (isUndefined(chartId) || isUndefined(nav.projectId)) {
      return;
    }

    let links = this.uiQuery.getValue().projectChartLinks;

    let link: ProjectChartLink = links.find(l => l.projectId === nav.projectId);

    if (link?.chartId === chartId) {
      return;
    }

    let newProjectChartLinks;

    if (isDefined(link)) {
      let newLink: ProjectChartLink = {
        projectId: nav.projectId,
        chartId: chartId,
        navTs: Date.now()
      };

      newProjectChartLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === nav.projectId))
      ];
    } else {
      let newLink: ProjectChartLink = {
        projectId: nav.projectId,
        chartId: chartId,
        navTs: Date.now()
      };

      newProjectChartLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectChartLinks = newProjectChartLinks.filter(
      l => l.navTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({ projectChartLinks: newProjectChartLinks });
    this.setUserUi({ projectChartLinks: newProjectChartLinks });
  }

  setProjectModelLink(item: { modelId: string }) {
    let { modelId } = item;

    let nav = this.navQuery.getValue();

    if (isUndefined(modelId) || isUndefined(nav.projectId)) {
      return;
    }

    let links = this.uiQuery.getValue().projectModelLinks;

    let link: ProjectModelLink = links.find(l => l.projectId === nav.projectId);

    if (link?.modelId === modelId) {
      return;
    }

    let newProjectModelLinks;

    if (isDefined(link)) {
      let newLink = {
        projectId: nav.projectId,
        modelId: modelId,
        navTs: Date.now()
      };

      newProjectModelLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === nav.projectId))
      ];
    } else {
      let newLink = {
        projectId: nav.projectId,
        modelId: modelId,
        navTs: Date.now()
      };

      newProjectModelLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectModelLinks = newProjectModelLinks.filter(
      l => l.navTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({ projectModelLinks: newProjectModelLinks });
    this.setUserUi({ projectModelLinks: newProjectModelLinks });
  }

  setProjectDashboardLink(item: { dashboardId: string }) {
    let { dashboardId } = item;

    let nav = this.navQuery.getValue();

    if (isUndefined(dashboardId) || isUndefined(nav.projectId)) {
      return;
    }

    let links = this.uiQuery.getValue().projectDashboardLinks;

    let link: ProjectDashboardLink = links.find(
      l => l.projectId === nav.projectId
    );

    if (link?.dashboardId === dashboardId) {
      return;
    }

    let newProjectDashboardLinks;

    if (isDefined(link)) {
      let newLink: ProjectDashboardLink = {
        projectId: nav.projectId,
        dashboardId: dashboardId,
        navTs: Date.now()
      };

      newProjectDashboardLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === nav.projectId))
      ];
    } else {
      let newLink: ProjectDashboardLink = {
        projectId: nav.projectId,
        dashboardId: dashboardId,
        navTs: Date.now()
      };

      newProjectDashboardLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectDashboardLinks = newProjectDashboardLinks.filter(
      l => l.navTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({
      projectDashboardLinks: newProjectDashboardLinks
    });
    this.setUserUi({
      projectDashboardLinks: newProjectDashboardLinks
    });
  }

  setProjectReportLink(item: { reportId: string }) {
    let { reportId } = item;

    let nav = this.navQuery.getValue();

    if (isUndefined(reportId) || isUndefined(nav.projectId)) {
      return;
    }

    let links = this.uiQuery.getValue().projectReportLinks;

    let link: ProjectReportLink = links.find(
      l => l.projectId === nav.projectId
    );

    if (link?.reportId === reportId) {
      return;
    }

    let newProjectReportLinks;

    if (isDefined(link)) {
      let newLink: ProjectReportLink = {
        projectId: nav.projectId,
        reportId: reportId,
        navTs: Date.now()
      };

      newProjectReportLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === nav.projectId))
      ];
    } else {
      let newLink: ProjectReportLink = {
        projectId: nav.projectId,
        reportId: reportId,
        navTs: Date.now()
      };

      newProjectReportLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectReportLinks = newProjectReportLinks.filter(
      l => l.navTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({ projectReportLinks: newProjectReportLinks });
    this.setUserUi({ projectReportLinks: newProjectReportLinks });
  }
}

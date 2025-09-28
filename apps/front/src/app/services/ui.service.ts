import { Injectable } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { ModelTreeLevelsEnum } from '~common/enums/model-tree-levels-enum.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ProjectChartLink } from '~common/interfaces/backend/project-chart-link';
import { ProjectDashboardLink } from '~common/interfaces/backend/project-dashboard-link';
import { ProjectFileLink } from '~common/interfaces/backend/project-file-link';
import { ProjectModelLink } from '~common/interfaces/backend/project-model-link';
import { ProjectReportLink } from '~common/interfaces/backend/project-report-link';
import { Ui } from '~common/interfaces/backend/ui';
import {
  ToBackendSetUserUiRequestPayload,
  ToBackendSetUserUiResponse
} from '~common/interfaces/to-backend/users/to-backend-set-user-ui';
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
    modelTreeLevels?: ModelTreeLevelsEnum;
    projectFileLinks?: ProjectFileLink[];
    projectModelLinks?: ProjectModelLink[];
    projectChartLinks?: ProjectChartLink[];
    projectDashboardLinks?: ProjectDashboardLink[];
    projectReportLinks?: ProjectReportLink[];
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

    let ui: Ui = {
      modelTreeLevels: isDefined(modelTreeLevels)
        ? modelTreeLevels
        : uiState.modelTreeLevels,
      timezone: isDefined(timezone) ? timezone : uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFraction: uiState.timeRangeFraction,
      projectFileLinks: isDefined(projectFileLinks)
        ? projectFileLinks
        : uiState.projectFileLinks,
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
        : uiState.projectReportLinks
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

  setProjectFileLink() {
    let fileId = this.fileQuery.getValue().fileId;

    let projectId = this.navQuery.getValue().projectId;

    if (isUndefined(projectId)) {
      return;
    }

    let links = this.uiQuery.getValue().projectFileLinks;

    let link: ProjectFileLink = links.find(l => l.projectId === projectId);

    let linkNewFileId = isDefined(fileId) ? fileId : link.fileId;

    if (isUndefined(link?.fileId) && isUndefined(linkNewFileId)) {
      return;
    }

    if (link?.fileId === linkNewFileId) {
      return;
    }

    let newProjectFileLinks: ProjectFileLink[];

    if (isDefined(link)) {
      let newLink: ProjectFileLink = {
        projectId: projectId,
        fileId: isDefined(fileId) ? fileId : link.fileId,
        navTs: Date.now()
      };

      newProjectFileLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === projectId))
      ];
    } else {
      let newLink: ProjectFileLink = {
        projectId: projectId,
        fileId: fileId,
        navTs: Date.now()
      };

      newProjectFileLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectFileLinks = newProjectFileLinks.filter(
      l => l.navTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({ projectFileLinks: newProjectFileLinks });
    this.setUserUi({ projectFileLinks: newProjectFileLinks });
  }
}

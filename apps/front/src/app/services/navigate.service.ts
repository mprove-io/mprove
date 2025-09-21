import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import {
  PATH_BRANCH,
  PATH_CHART,
  PATH_CHARTS_LIST,
  PATH_DASHBOARD,
  PATH_DASHBOARDS,
  PATH_DASHBOARDS_LIST,
  PATH_ENV,
  PATH_FILE,
  PATH_FILES,
  PATH_MODEL,
  PATH_MODELS,
  PATH_MODELS_LIST,
  PATH_ORG,
  PATH_PROFILE,
  PATH_PROJECT,
  PATH_REPO,
  PATH_REPORT,
  PATH_REPORTS,
  PATH_REPORTS_LIST,
  PROD_REPO_ID
} from '~common/constants/top';
import { PanelEnum } from '~common/enums/panel.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeQueryParams } from '../functions/make-query-params';
import { ModelQuery, ModelState } from '../queries/model.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { UiQuery } from '../queries/ui.query';
import { UserQuery } from '../queries/user.query';

@Injectable({ providedIn: 'root' })
export class NavigateService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
    })
  );

  userId: string;
  userId$ = this.userQuery.userId$.pipe(
    tap(x => {
      this.userId = x;
    })
  );

  constructor(
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private modelQuery: ModelQuery,
    private userQuery: UserQuery,
    private router: Router
  ) {
    this.nav$.subscribe();
    this.model$.subscribe();
    this.userId$.subscribe();
  }

  navigateTo(item: { navParts: string[] }) {
    let { navParts } = item;

    this.router.navigate(navParts);
  }

  navigateToProfile() {
    this.router.navigate([PATH_PROFILE]);
  }

  navigateToFiles(branchId?: string) {
    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      repoId,
      PATH_BRANCH,
      isDefined(branchId) ? branchId : this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_FILES
    ]);
  }

  navigateToFileLine(item: {
    panel: PanelEnum;
    encodedFileId: string;
    lineNumber?: number;
  }) {
    let { panel, encodedFileId, lineNumber } = item;

    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    let ar: any[] = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_FILES,
      PATH_FILE,
      encodedFileId
    ];

    this.router.navigate(ar, {
      queryParams: {
        panel: panel
      }
    });

    setTimeout(() => {
      this.router.navigate(ar, {
        queryParams: {
          panel: panel,
          line: lineNumber
        }
      });
    }, 0);
  }

  navigateToModels() {
    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_MODELS
    ]);
  }

  navigateToChartsList(item: { modelId: string }) {
    let { modelId } = item;

    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    let navTo = isDefined(modelId)
      ? [
          PATH_ORG,
          this.nav.orgId,
          PATH_PROJECT,
          this.nav.projectId,
          PATH_REPO,
          repoId,
          PATH_BRANCH,
          this.nav.branchId,
          PATH_ENV,
          this.nav.envId,
          PATH_MODELS,
          PATH_MODEL,
          modelId,
          PATH_CHARTS_LIST
        ]
      : [
          PATH_ORG,
          this.nav.orgId,
          PATH_PROJECT,
          this.nav.projectId,
          PATH_REPO,
          repoId,
          PATH_BRANCH,
          this.nav.branchId,
          PATH_ENV,
          this.nav.envId,
          PATH_MODELS,
          PATH_CHARTS_LIST
        ];

    this.router.navigate(navTo);
  }

  navigateToModelsList(item: { modelId: string }) {
    let { modelId } = item;

    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    let navTo = isDefined(modelId)
      ? [
          PATH_ORG,
          this.nav.orgId,
          PATH_PROJECT,
          this.nav.projectId,
          PATH_REPO,
          repoId,
          PATH_BRANCH,
          this.nav.branchId,
          PATH_ENV,
          this.nav.envId,
          PATH_MODELS,
          PATH_MODEL,
          modelId,
          PATH_MODELS_LIST
        ]
      : [
          PATH_ORG,
          this.nav.orgId,
          PATH_PROJECT,
          this.nav.projectId,
          PATH_REPO,
          repoId,
          PATH_BRANCH,
          this.nav.branchId,
          PATH_ENV,
          this.nav.envId,
          PATH_MODELS,
          PATH_MODELS_LIST
        ];

    this.router.navigate(navTo);
  }

  navigateToChart(item: { modelId: string; chartId: string }) {
    let { modelId, chartId } = item;

    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    let uiState = this.uiQuery.getValue();

    return this.router.navigate(
      [
        PATH_ORG,
        this.nav.orgId,
        PATH_PROJECT,
        this.nav.projectId,
        PATH_REPO,
        repoId,
        PATH_BRANCH,
        this.nav.branchId,
        PATH_ENV,
        this.nav.envId,
        PATH_MODELS,
        PATH_MODEL,
        isDefined(modelId) ? modelId : this.model.modelId,
        PATH_CHART,
        chartId
      ],
      { queryParams: { timezone: uiState.timezone.split('/').join('-') } }
    );
  }

  navigateToDashboards(item?: { extra?: any }) {
    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    let navTo = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_DASHBOARDS
    ];

    this.router.navigate(navTo);
  }

  navigateToDashboardsList() {
    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    let navTo = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_DASHBOARDS,
      PATH_DASHBOARDS_LIST
    ];

    this.router.navigate(navTo);
  }

  navigateToDashboard(item: { dashboardId: string }) {
    let { dashboardId } = item;

    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    let uiState = this.uiQuery.getValue();

    this.router.navigate(
      [
        PATH_ORG,
        this.nav.orgId,
        PATH_PROJECT,
        this.nav.projectId,
        PATH_REPO,
        repoId,
        PATH_BRANCH,
        this.nav.branchId,
        PATH_ENV,
        this.nav.envId,
        PATH_DASHBOARDS,
        PATH_DASHBOARD,
        dashboardId
      ],
      { queryParams: { timezone: uiState.timezone.split('/').join('-') } }
    );
  }

  navigateToReports() {
    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    let navTo = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_REPORTS
    ];

    this.router.navigate(navTo);
  }

  navigateToReportsList() {
    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    let navTo = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_REPORTS,
      PATH_REPORTS_LIST
    ];

    this.router.navigate(navTo);
  }

  navigateToReport(item: { reportId: string; skipDeselect?: boolean }) {
    let { reportId, skipDeselect } = item;

    let uiState = this.uiQuery.getValue();

    if (skipDeselect === false && isDefined(uiState.gridApi)) {
      uiState.gridApi.deselectAll();
    }

    let repoId = this.nav.isRepoProd === true ? PROD_REPO_ID : this.userId;

    let navTo = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_REPORTS,
      PATH_REPORT,
      reportId
    ];

    this.router.navigate(navTo, {
      queryParams: makeQueryParams({
        timezone: uiState.timezone,
        timeSpec: uiState.timeSpec,
        timeRangeFraction: uiState.timeRangeFraction
      })
    });
  }
}

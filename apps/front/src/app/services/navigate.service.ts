import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import {
  PATH_BRANCH,
  PATH_BUILDER,
  PATH_CHART,
  PATH_CHARTS_LIST,
  PATH_DASHBOARD,
  PATH_DASHBOARDS,
  PATH_DASHBOARDS_LIST,
  PATH_ENV,
  PATH_FILE,
  PATH_MODEL,
  PATH_MODELS,
  PATH_MODELS_LIST,
  PATH_NEW_SESSION,
  PATH_ORG,
  PATH_PROFILE,
  PATH_PROJECT,
  PATH_REPO,
  PATH_REPORT,
  PATH_REPORTS,
  PATH_REPORTS_LIST,
  PATH_SELECT_FILE,
  PATH_SESSION
} from '#common/constants/top';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { isDefined } from '#common/functions/is-defined';
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

  async navigateTo(item: { navParts: string[] }) {
    let { navParts } = item;

    return this.router.navigate(navParts);
  }

  async navigateToProfile() {
    return this.router.navigate([PATH_PROFILE]);
  }

  async navigateToBuilder(item?: {
    repoId?: string;
    branchId?: string;
    left?: BuilderLeftEnum;
    right?: string;
    selectFile?: boolean;
  }) {
    let uiState = this.uiQuery.getValue();

    let left = item?.left || uiState.builderLeft;
    let right = item?.right || uiState.builderRight;

    let isChanges =
      left === BuilderLeftEnum.ChangesToCommit ||
      left === BuilderLeftEnum.ChangesToPush;
    let centerPath =
      isChanges || item?.selectFile === true
        ? PATH_SELECT_FILE
        : PATH_NEW_SESSION;

    return this.router.navigate(
      [
        PATH_ORG,
        this.nav.orgId,
        PATH_PROJECT,
        this.nav.projectId,
        PATH_REPO,
        isDefined(item?.repoId) ? item.repoId : this.nav.repoId,
        PATH_BRANCH,
        isDefined(item?.branchId) ? item.branchId : this.nav.branchId,
        PATH_ENV,
        this.nav.envId,
        PATH_BUILDER,
        centerPath
      ],
      { queryParams: { left, right } }
    );
  }

  async navigateToFileLine(item: {
    builderLeft?: BuilderLeftEnum;
    encodedFileId: string;
    lineNumber?: number;
  }) {
    let { builderLeft, encodedFileId, lineNumber } = item;

    let uiState = this.uiQuery.getValue();

    let left = builderLeft || uiState.builderLeft;
    let right = uiState.builderRight;

    let ar: any[] = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      this.nav.repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_BUILDER,
      PATH_FILE,
      encodedFileId
    ];

    let queryParams: Record<string, any> = { left, right };

    if (isDefined(lineNumber)) {
      queryParams.line = lineNumber;
    }

    return this.router.navigate(ar, { queryParams });
  }

  async navigateToModels() {
    return this.router.navigate([
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      this.nav.repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_MODELS
    ]);
  }

  async navigateToChartsList(item: { modelId: string }) {
    let { modelId } = item;

    let navTo = isDefined(modelId)
      ? [
          PATH_ORG,
          this.nav.orgId,
          PATH_PROJECT,
          this.nav.projectId,
          PATH_REPO,
          this.nav.repoId,
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
          this.nav.repoId,
          PATH_BRANCH,
          this.nav.branchId,
          PATH_ENV,
          this.nav.envId,
          PATH_MODELS,
          PATH_CHARTS_LIST
        ];

    return this.router.navigate(navTo);
  }

  async navigateToModelsList(item: { modelId: string }) {
    let { modelId } = item;

    let navTo = isDefined(modelId)
      ? [
          PATH_ORG,
          this.nav.orgId,
          PATH_PROJECT,
          this.nav.projectId,
          PATH_REPO,
          this.nav.repoId,
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
          this.nav.repoId,
          PATH_BRANCH,
          this.nav.branchId,
          PATH_ENV,
          this.nav.envId,
          PATH_MODELS,
          PATH_MODELS_LIST
        ];

    return this.router.navigate(navTo);
  }

  async navigateToChart(item: { modelId: string; chartId: string }) {
    let { modelId, chartId } = item;

    let uiState = this.uiQuery.getValue();

    return this.router.navigate(
      [
        PATH_ORG,
        this.nav.orgId,
        PATH_PROJECT,
        this.nav.projectId,
        PATH_REPO,
        this.nav.repoId,
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

  async navigateToDashboards(item?: { extra?: any }) {
    let navTo = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      this.nav.repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_DASHBOARDS
    ];

    return this.router.navigate(navTo);
  }

  async navigateToDashboardsList() {
    let navTo = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      this.nav.repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_DASHBOARDS,
      PATH_DASHBOARDS_LIST
    ];

    return this.router.navigate(navTo);
  }

  async navigateToDashboard(item: { dashboardId: string }) {
    let { dashboardId } = item;

    let uiState = this.uiQuery.getValue();

    return this.router.navigate(
      [
        PATH_ORG,
        this.nav.orgId,
        PATH_PROJECT,
        this.nav.projectId,
        PATH_REPO,
        this.nav.repoId,
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

  async navigateToReports() {
    let navTo = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      this.nav.repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_REPORTS
    ];

    return this.router.navigate(navTo);
  }

  async navigateToReportsList() {
    let navTo = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      this.nav.repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_REPORTS,
      PATH_REPORTS_LIST
    ];

    return this.router.navigate(navTo);
  }

  async navigateToSession(item: {
    sessionId: string;
    repoId?: string;
    branchId?: string;
    left?: BuilderLeftEnum;
    right?: string;
  }) {
    let { sessionId } = item;

    let uiState = this.uiQuery.getValue();

    let left = item.left || uiState.builderLeft;
    let right = item.right || uiState.builderRight;

    let repoId = item.repoId || this.nav.repoId;

    let branchId = item.branchId || this.nav.branchId;

    return this.router.navigate(
      [
        PATH_ORG,
        this.nav.orgId,
        PATH_PROJECT,
        this.nav.projectId,
        PATH_REPO,
        repoId,
        PATH_BRANCH,
        branchId,
        PATH_ENV,
        this.nav.envId,
        PATH_BUILDER,
        PATH_SESSION,
        sessionId
      ],
      { queryParams: { left, right } }
    );
  }

  async navigateToReport(item: { reportId: string; skipDeselect?: boolean }) {
    let { reportId, skipDeselect } = item;

    let uiState = this.uiQuery.getValue();

    if (skipDeselect === false && isDefined(uiState.gridApi)) {
      uiState.gridApi.deselectAll();
    }

    let navTo = [
      PATH_ORG,
      this.nav.orgId,
      PATH_PROJECT,
      this.nav.projectId,
      PATH_REPO,
      this.nav.repoId,
      PATH_BRANCH,
      this.nav.branchId,
      PATH_ENV,
      this.nav.envId,
      PATH_REPORTS,
      PATH_REPORT,
      reportId
    ];

    return this.router.navigate(navTo, {
      queryParams: makeQueryParams({
        timezone: uiState.timezone,
        timeSpec: uiState.timeSpec,
        timeRangeFraction: uiState.timeRangeFraction
      })
    });
  }
}

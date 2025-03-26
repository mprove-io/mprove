import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { makeRepQueryParams } from '../functions/make-query-params';
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

  navigateToProfile() {
    this.router.navigate([common.PATH_PROFILE]);
  }

  navigateMconfigQuery(item: {
    mconfigId: string;
    queryId: string;
    modelId?: string;
  }) {
    let { mconfigId, queryId, modelId } = item;

    let repoId =
      this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId,
      common.PATH_MODEL,
      common.isDefined(modelId) ? modelId : this.model.modelId,
      common.PATH_MCONFIG,
      mconfigId,
      common.PATH_QUERY,
      queryId
    ]);
  }

  navigateToModel(modelId?: string) {
    let repoId =
      this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

    let toModelId = common.isDefined(modelId) ? modelId : this.model.modelId;

    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId,
      common.PATH_MODEL,
      toModelId,
      common.PATH_MCONFIG,
      common.EMPTY_MCONFIG_ID,
      common.PATH_QUERY,
      common.EMPTY_QUERY_ID
    ]);
  }

  navigateToDashboard(dashboardId: string) {
    let repoId =
      this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

    let uiState = this.uiQuery.getValue();

    this.router.navigate(
      [
        common.PATH_ORG,
        this.nav.orgId,
        common.PATH_PROJECT,
        this.nav.projectId,
        common.PATH_REPO,
        repoId,
        common.PATH_BRANCH,
        this.nav.branchId,
        common.PATH_ENV,
        this.nav.envId,
        common.PATH_DASHBOARDS,
        common.PATH_DASHBOARD,
        dashboardId
      ],
      { queryParams: { timezone: uiState.timezone.split('/').join('-') } }
    );
  }

  navigateToFiles(branchId?: string) {
    let repoId =
      this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      common.isDefined(branchId) ? branchId : this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId,
      common.PATH_FILES
    ]);
  }

  navigateToProductionDefaultBranchProdMetrics() {
    if (
      common.isDefined(this.nav.orgId) &&
      common.isDefined(this.nav.projectId)
    ) {
      // let repoId =
      //   this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

      let navTo = [
        common.PATH_ORG,
        this.nav.orgId,
        common.PATH_PROJECT,
        this.nav.projectId,
        common.PATH_REPO,
        common.PROD_REPO_ID,
        common.PATH_BRANCH,
        this.nav.projectDefaultBranch,
        common.PATH_ENV,
        common.PROJECT_ENV_PROD,
        common.PATH_METRICS,
        common.PATH_REPORT,
        common.LAST_SELECTED_REPORT_ID
      ];

      this.router.navigate(navTo);
    }
  }

  navigateTo(item: { navParts: string[] }) {
    let { navParts } = item;
    this.router.navigate(navParts);
  }

  navigateToCharts(item?: { navParts?: string[]; extra?: any }) {
    let { navParts, extra } = item;

    let repoId =
      this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

    let navTo = common.isDefined(navParts)
      ? navParts
      : [
          common.PATH_ORG,
          this.nav.orgId,
          common.PATH_PROJECT,
          this.nav.projectId,
          common.PATH_REPO,
          repoId,
          common.PATH_BRANCH,
          this.nav.branchId,
          common.PATH_ENV,
          this.nav.envId,
          common.PATH_CHARTS
        ];

    if (common.isDefined(extra)) {
      this.router.navigate(navTo, extra);
    } else {
      this.router.navigate(navTo);
    }
  }

  windowOpenModels() {
    let repoId =
      this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

    let navTo = [
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId,
      common.PATH_MODELS
    ];

    window.open(navTo.join('/'), '_self');
  }

  navigateToModels() {
    let repoId =
      this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

    let navTo = [
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId,
      common.PATH_MODELS
    ];

    this.router.navigate(navTo);
  }

  navigateToDashboards(item?: { extra?: any }) {
    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    let repoId = this.nav.isRepoProd === true ? common.PROD_REPO_ID : userId;

    let navTo = [
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId,
      common.PATH_DASHBOARDS
    ];

    if (common.isDefined(item?.extra)) {
      this.router.navigate(navTo, item?.extra);
    } else {
      this.router.navigate(navTo);
    }
  }

  navigateToDashboardsList() {
    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    let repoId = this.nav.isRepoProd === true ? common.PROD_REPO_ID : userId;

    let navTo = [
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId,
      common.PATH_DASHBOARDS,
      common.PATH_DASHBOARDS_LIST
    ];

    this.router.navigate(navTo);
  }

  reloadCharts() {
    let repoId =
      this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId
    ]);

    setTimeout(() =>
      this.router.navigate([
        common.PATH_ORG,
        this.nav.orgId,
        common.PATH_PROJECT,
        this.nav.projectId,
        common.PATH_REPO,
        repoId,
        common.PATH_BRANCH,
        this.nav.branchId,
        common.PATH_ENV,
        this.nav.envId,
        common.PATH_CHARTS
      ])
    );
  }

  navigateToFileLine(item: {
    panel: common.PanelEnum;
    underscoreFileId: string;
    lineNumber?: number;
  }) {
    let { panel, underscoreFileId, lineNumber } = item;

    let repoId =
      this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

    let ar: any[] = [
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId,
      common.PATH_FILES,
      common.PATH_FILE,
      underscoreFileId
    ];

    this.router.navigate(ar, {
      queryParams: {
        panel: panel,
        line: lineNumber
      }
    });
  }

  navigateToMetricsRep(item: { reportId: string; skipDeselect?: boolean }) {
    let { reportId, skipDeselect } = item;

    let uiState = this.uiQuery.getValue();

    if (skipDeselect === false && common.isDefined(uiState.gridApi)) {
      uiState.gridApi.deselectAll();
    }

    let repoId =
      this.nav.isRepoProd === true ? common.PROD_REPO_ID : this.userId;

    let navTo = [
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId,
      common.PATH_METRICS,
      common.PATH_REPORT,
      reportId
    ];

    this.router.navigate(navTo, {
      queryParams: makeRepQueryParams({
        timezone: uiState.timezone,
        timeSpec: uiState.timeSpec,
        timeRangeFraction: uiState.timeRangeFraction
      })
    });
  }
}

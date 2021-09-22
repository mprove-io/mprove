import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { ModelQuery } from '../queries/model.query';
import { NavQuery } from '../queries/nav.query';
import { UserQuery } from '../queries/user.query';
import { ModelState } from '../stores/model.store';
import { NavState } from '../stores/nav.store';

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

  // navigateSwitch(newMconfigId: string, newQueryId: string) {
  //   let pathArray: string[] = this.router.url.split('/');

  //   switch (pathArray[11]) {
  //     case 'filters': {
  //       this.navigateMconfigQueryFilters(newMconfigId, newQueryId);
  //       break;
  //     }

  //     case 'sql': {
  //       this.navigateMconfigQuerySql(newMconfigId, newQueryId);
  //       break;
  //     }

  //     case 'data': {
  //       this.navigateMconfigQueryData(newMconfigId, newQueryId);
  //       break;
  //     }

  //     case 'chart': {
  //       this.navigateMconfigQueryChart(newMconfigId, newQueryId);
  //       break;
  //     }

  //     default: {
  //       this.navigateMconfigQueryData(newMconfigId, newQueryId);
  //     }
  //   }
  // }

  navigateMconfigQueryData(item: {
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
      common.PATH_MODEL,
      common.isDefined(modelId) ? modelId : this.model.modelId,
      common.PATH_MCONFIG,
      mconfigId,
      common.PATH_QUERY,
      queryId
    ]);
  }

  // navigateMconfigQueryFilters(mconfigId?: string, queryId?: string) {
  //   this.getStoreValues();
  //   this.router.navigate([
  //     '/project',
  //     this.projectId,
  //     'mode',
  //     this.mode,
  //     'model',
  //     this.modelId,
  //     'mconfig',
  //     mconfigId ? mconfigId : this.mconfigId,
  //     'query',
  //     queryId ? queryId : this.queryId,
  //     'filters'
  //   ]);
  // }

  // navigateMconfigQuerySql(mconfigId?: string, queryId?: string) {
  //   this.getStoreValues();
  //   this.router.navigate([
  //     '/project',
  //     this.projectId,
  //     'mode',
  //     this.mode,
  //     'model',
  //     this.modelId,
  //     'mconfig',
  //     mconfigId ? mconfigId : this.mconfigId,
  //     'query',
  //     queryId ? queryId : this.queryId,
  //     'sql'
  //   ]);
  // }

  // navigateMconfigQueryChart(
  //   mconfigId?: string,
  //   queryId?: string,
  //   chartId?: string
  // ) {
  //   this.getStoreValues();
  //   this.router.navigate([
  //     '/project',
  //     this.projectId,
  //     'mode',
  //     this.mode,
  //     'model',
  //     this.modelId,
  //     'mconfig',
  //     mconfigId ? mconfigId : this.mconfigId,
  //     'query',
  //     queryId ? queryId : this.queryId,
  //     'chart',
  //     chartId ? chartId : this.chartId
  //   ]);
  // }

  // navigateModelMconfigQueryChart(
  //   modelId?: string,
  //   mconfigId?: string,
  //   queryId?: string,
  //   chartId?: string
  // ) {
  //   this.getStoreValues();
  //   this.router.navigate([
  //     '/project',
  //     this.projectId,
  //     'mode',
  //     this.mode,
  //     'model',
  //     modelId ? modelId : this.modelId,
  //     'mconfig',
  //     mconfigId ? mconfigId : this.mconfigId,
  //     'query',
  //     queryId ? queryId : this.queryId,
  //     'chart',
  //     chartId ? chartId : this.chartId
  //   ]);
  // }

  // navigateDashboard(dashboardId: string) {
  //   this.getStoreValues();
  //   this.router.navigate([
  //     '/project',
  //     this.projectId,
  //     'mode',
  //     this.mode,
  //     'dashboard',
  //     dashboardId
  //   ]);
  // }

  // navigateModel(modelId?: string, joinAs?: string) {
  //   this.getStoreValues();
  //   this.router.navigate(
  //     [
  //       '/project',
  //       this.projectId,
  //       'mode',
  //       this.mode,
  //       'model',
  //       modelId ? modelId : this.modelId
  //     ],
  //     {
  //       queryParams: { joinAs: joinAs }
  //     }
  //   );
  // }

  navigateToModel(modelId: string) {
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
      common.PATH_MODEL,
      modelId,
      common.PATH_MCONFIG,
      common.EMPTY,
      common.PATH_QUERY,
      common.EMPTY
    ]);
  }

  navigateToBlockml(branchId?: string) {
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
      common.PATH_BLOCKML
    ]);
  }

  navigateToProdMasterVizs() {
    let navTo = [
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      common.PROD_REPO_ID,
      common.PATH_BRANCH,
      common.BRANCH_MASTER,
      common.PATH_VISUALIZATIONS
    ];

    this.router.navigate(navTo);
  }

  navigateToVizs(item?: { navParts?: string[]; extra?: any }) {
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
          common.PATH_VISUALIZATIONS
        ];

    if (common.isDefined(extra)) {
      this.router.navigate(navTo, extra);
    } else {
      this.router.navigate(navTo);
    }
  }

  reloadVizs() {
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
      this.nav.branchId
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
        common.PATH_VISUALIZATIONS
      ])
    );
  }

  navigateToFileLine(item: { underscoreFileId: string; lineNumber?: number }) {
    let { underscoreFileId, lineNumber } = item;

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
      common.PATH_BLOCKML,
      common.PATH_FILE,
      underscoreFileId
    ];

    // console.log(ar);

    if (common.isDefined(lineNumber) && lineNumber !== 0) {
      this.router.navigate(ar, {
        queryParams: { line: lineNumber }
      });
    } else {
      this.router.navigate(ar);
    }
  }
}

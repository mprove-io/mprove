import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { UserQuery } from '../queries/user.query';
import { NavState } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class NavigateService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      // this.cd.detectChanges();
    })
  );

  userId: string;
  userId$ = this.userQuery.userId$.pipe(
    tap(x => {
      this.userId = x;
      // this.cd.detectChanges();
    })
  );

  constructor(
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private router: Router
  ) {
    this.nav$.subscribe();
    this.userId$.subscribe();
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

  // navigateMconfigQueryData(mconfigId?: string, queryId?: string) {
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
  //     'data'
  //   ]);
  // }

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

  navigateToFileLine(fileId: string, line?: number) {
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
      fileId
    ];

    console.log(ar);

    if (common.isDefined(line)) {
      this.router.navigate(ar, {
        queryParams: { line: line }
      });
    } else {
      this.router.navigate(ar);
    }
  }

  // private getStoreValues() {
  //   this.store
  //     .select(selectors.getLayoutProjectId)
  //     .pipe(take(1))
  //     .subscribe(x => (this.projectId = x));

  //   this.store
  //     .select(selectors.getLayoutMode)
  //     .pipe(take(1))
  //     .subscribe(x => (this.mode = x));

  //   this.store
  //     .select(selectors.getSelectedProjectModeRepoModelId)
  //     .pipe(take(1))
  //     .subscribe(x => (this.modelId = x));

  //   this.store
  //     .select(selectors.getSelectedMconfigId)
  //     .pipe(take(1))
  //     .subscribe(x => (this.mconfigId = x));

  //   this.store
  //     .select(selectors.getSelectedQueryId)
  //     .pipe(take(1))
  //     .subscribe(x => (this.queryId = x));

  //   this.store
  //     .select(selectors.getLayoutChartId)
  //     .pipe(take(1))
  //     .subscribe(x => (this.chartId = x));
  // }
}

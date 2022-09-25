import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs/operators';
import { constants } from '~common/barrels/constants';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { NavState } from '~front/app/stores/nav.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  member: common.Member;
  member$ = this.memberQuery.select().pipe(
    tap(x => {
      this.member = x;
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  isFilesRouteActive: boolean;
  isVizsRouteActive: boolean;
  isDashboardsRouteActive: boolean;
  isModelsRouteActive: boolean;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.checkUrls(x.url);
    })
  );

  constructor(
    private router: Router,
    public navQuery: NavQuery,
    public uiQuery: UiQuery,
    public userQuery: UserQuery,
    public memberQuery: MemberQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkUrls(this.router.url);
  }

  checkUrls(url: string) {
    this.isFilesRouteActive = url.split('/')[11] === constants.PATH_FILES;
    this.isVizsRouteActive =
      url.split('/')[11] === constants.PATH_VISUALIZATIONS;
    this.isDashboardsRouteActive =
      url.split('/')[11] === constants.PATH_DASHBOARDS;
    this.isModelsRouteActive = url.split('/')[11] === constants.PATH_MODELS;
    this.cd.detectChanges();
  }

  navigateFiles() {
    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    let repoId = this.nav.isRepoProd === true ? common.PROD_REPO_ID : userId;

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
      common.PATH_FILES
    ]);
  }

  navigateVisualizations() {
    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    let repoId = this.nav.isRepoProd === true ? common.PROD_REPO_ID : userId;

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
      common.PATH_VISUALIZATIONS
    ]);
  }

  navigateDashboards() {
    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    let repoId = this.nav.isRepoProd === true ? common.PROD_REPO_ID : userId;

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
      common.PATH_DASHBOARDS
    ]);
  }

  navigateModels() {
    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    let repoId = this.nav.isRepoProd === true ? common.PROD_REPO_ID : userId;

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
      common.PATH_MODELS
    ]);
  }
}

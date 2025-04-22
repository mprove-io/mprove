import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { constants } from '~common/barrels/constants';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { NavigateService } from '~front/app/services/navigate.service';
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
  isChartsRouteActive: boolean;
  isDashboardsRouteActive: boolean;
  isReportsRouteActive: boolean;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.checkUrls(x.url);
    })
  );

  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private router: Router,
    private navQuery: NavQuery,
    private repoQuery: RepoQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private memberQuery: MemberQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkUrls(this.router.url);
  }

  checkUrls(url: string) {
    this.isFilesRouteActive =
      url.split('?')[0]?.split('/')[11] === constants.PATH_FILES;

    this.isChartsRouteActive =
      url.split('?')[0]?.split('/')[11] === constants.PATH_CHARTS;

    this.isDashboardsRouteActive =
      url.split('?')[0]?.split('/')[11] === constants.PATH_DASHBOARDS;

    this.isReportsRouteActive =
      url.split('?')[0]?.split('/')[11] === constants.PATH_REPORTS;

    this.cd.detectChanges();
  }

  navigateFiles() {
    this.navigateService.navigateToFiles();

    this.uiQuery.updatePart({ panel: common.PanelEnum.Tree });

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: common.LAST_SELECTED_FILE_ID
    });
  }

  navigateCharts() {
    if (this.isChartsRouteActive === true) {
      return;
    }

    this.navigateService.navigateToChart({
      modelId: common.LAST_SELECTED_MODEL_ID,
      chartId: common.LAST_SELECTED_CHART_ID
    });
  }

  navigateDashboards() {
    if (this.isDashboardsRouteActive === true) {
      return;
    }

    this.navigateService.navigateToDashboard({
      dashboardId: common.LAST_SELECTED_DASHBOARD_ID
    });
  }

  navigateReports() {
    if (this.isReportsRouteActive === true) {
      return;
    }

    this.navigateService.navigateToReport({
      reportId: common.LAST_SELECTED_REPORT_ID,
      skipDeselect: true
    });
  }
}

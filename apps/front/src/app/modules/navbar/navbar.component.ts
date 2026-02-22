import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import {
  EMPTY_REPORT_ID,
  PATH_BUILDER,
  PATH_DASHBOARDS,
  PATH_MODELS,
  PATH_REPORTS
} from '#common/constants/top';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { BuilderRightEnum } from '#common/enums/builder-right.enum';
import { isDefined } from '#common/functions/is-defined';
import { Member } from '#common/interfaces/backend/member';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
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

  member: Member;
  member$ = this.memberQuery.select().pipe(
    tap(x => {
      this.member = x;
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  isBuilderRouteActive: boolean;
  isModelsRouteActive: boolean;
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
    this.isBuilderRouteActive =
      url.split('?')[0]?.split('/')[11] === PATH_BUILDER;

    this.isModelsRouteActive =
      url.split('?')[0]?.split('/')[11] === PATH_MODELS;

    this.isDashboardsRouteActive =
      url.split('?')[0]?.split('/')[11] === PATH_DASHBOARDS;

    this.isReportsRouteActive =
      url.split('?')[0]?.split('/')[11] === PATH_REPORTS;

    this.cd.detectChanges();
  }

  navigateBuilder() {
    if (this.isBuilderRouteActive === true) {
      return;
    }

    let projectSessionLinks = this.uiQuery.getValue().projectSessionLinks;

    let pLink = projectSessionLinks.find(
      link => link.projectId === this.nav.projectId
    );

    if (isDefined(pLink?.sessionId)) {
      this.navigateService.navigateToSession({
        sessionId: pLink.sessionId,
        left: BuilderLeftEnum.Info,
        right: BuilderRightEnum.Sessions
      });
    } else {
      this.navigateService.navigateToBuilder({
        left: BuilderLeftEnum.Info,
        right: BuilderRightEnum.Sessions
      });
    }
  }

  navigateCharts() {
    if (this.isModelsRouteActive === true) {
      return;
    }

    let projectModelLinks = this.uiQuery.getValue().projectModelLinks;
    let projectChartLinks = this.uiQuery.getValue().projectChartLinks;

    let pModelLink = projectModelLinks.find(
      link => link.projectId === this.nav.projectId
    );

    let pChartLink = projectChartLinks.find(
      link => link.projectId === this.nav.projectId
    );

    if (isDefined(pModelLink) && isDefined(pChartLink)) {
      this.navigateService.navigateToChart({
        modelId: pModelLink.modelId,
        chartId: pChartLink.chartId
      });
    } else {
      this.navigateService.navigateToModels();
    }
  }

  navigateDashboards() {
    if (this.isDashboardsRouteActive === true) {
      return;
    }

    let projectDashboardLinks = this.uiQuery.getValue().projectDashboardLinks;
    let pLink = projectDashboardLinks.find(
      link => link.projectId === this.nav.projectId
    );

    if (isDefined(pLink?.dashboardId)) {
      this.navigateService.navigateToDashboard({
        dashboardId: pLink.dashboardId
      });
    } else {
      this.navigateService.navigateToDashboardsList();
    }
  }

  navigateReports() {
    if (this.isReportsRouteActive === true) {
      return;
    }

    let projectReportLinks = this.uiQuery.getValue().projectReportLinks;

    let pLink = projectReportLinks.find(
      link => link.projectId === this.nav.projectId
    );

    if (isDefined(pLink) && pLink.reportId === EMPTY_REPORT_ID) {
      this.navigateService.navigateToReport({ reportId: EMPTY_REPORT_ID });
    } else if (isDefined(pLink)) {
      this.navigateService.navigateToReport({ reportId: pLink.reportId });
    } else {
      this.navigateService.navigateToReportsList();
    }
  }
}

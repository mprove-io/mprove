import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import {
  LAST_SELECTED_CHART_ID,
  LAST_SELECTED_DASHBOARD_ID,
  LAST_SELECTED_MODEL_ID,
  LAST_SELECTED_REPORT_ID,
  PATH_BUILDER,
  PATH_DASHBOARDS,
  PATH_MODELS,
  PATH_REPORTS
} from '#common/constants/top';
import { PanelEnum } from '#common/enums/panel.enum';
import { getFileIds } from '#common/functions/get-file-ids';
import { isDefined } from '#common/functions/is-defined';
import { Member } from '#common/interfaces/backend/member';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

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
    private cd: ChangeDetectorRef,
    private uiService: UiService
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

    let repo = this.repoQuery.getValue();
    let fileIds = getFileIds({ nodes: repo.nodes });
    let projectFileLinks = this.uiQuery.getValue().projectFileLinks;

    let pLink = projectFileLinks.find(
      link => link.projectId === this.nav.projectId
    );

    if (isDefined(pLink)) {
      let pFileId = fileIds.find(fileId => fileId === pLink.fileId);

      if (isDefined(pFileId)) {
        this.uiService.ensureFilesLeftPanel();
        this.navigateService.navigateToFileLine({
          panel: PanelEnum.Tree,
          encodedFileId: pFileId
        });
        return;
      }
    } else {
      this.navigateService.navigateToBuilder();
    }
  }

  navigateCharts() {
    if (this.isModelsRouteActive === true) {
      return;
    }

    this.navigateService.navigateToChart({
      modelId: LAST_SELECTED_MODEL_ID,
      chartId: LAST_SELECTED_CHART_ID
    });
  }

  navigateDashboards() {
    if (this.isDashboardsRouteActive === true) {
      return;
    }

    this.navigateService.navigateToDashboard({
      dashboardId: LAST_SELECTED_DASHBOARD_ID
    });
  }

  navigateReports() {
    if (this.isReportsRouteActive === true) {
      return;
    }

    this.navigateService.navigateToReport({
      reportId: LAST_SELECTED_REPORT_ID,
      skipDeselect: true
    });
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, take, tap } from 'rxjs/operators';
import {
  EMPTY_REPORT_ID,
  PATH_BUILDER,
  PATH_DASHBOARDS,
  PATH_EXPLORER,
  PATH_MODELS,
  PATH_REPORTS
} from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { BuilderRightEnum } from '#common/enums/builder-right.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { Member } from '#common/zod/backend/member';
import type {
  ToBackendCheckLastNavRequestPayload,
  ToBackendCheckLastNavResponse
} from '#common/zod/to-backend/nav/to-backend-check-last-nav';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { SessionQuery, SessionState } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { environment } from '#front/environments/environment';

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

  explorerEnabled = environment.explorerEnabled;

  isBuilderRouteActive: boolean;
  isExplorerRouteActive: boolean;
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

  session: SessionState;
  session$ = this.sessionQuery.select().pipe(
    tap(x => {
      this.session = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private router: Router,
    private navQuery: NavQuery,
    private repoQuery: RepoQuery,
    private sessionQuery: SessionQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private memberQuery: MemberQuery,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkUrls(this.router.url);
  }

  checkUrls(url: string) {
    this.isBuilderRouteActive =
      url.split('?')[0]?.split('/')[11] === PATH_BUILDER;

    this.isExplorerRouteActive =
      url.split('?')[0]?.split('/')[11] === PATH_EXPLORER;

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

    this.uiQuery.updatePart({ showSessionInput: false });
    this.sessionQuery.reset();
    this.sessionBundleQuery.reset();
    this.sessionEventsQuery.reset();

    this.navigateService.navigateToBuilder({
      left: BuilderLeftEnum.Tree,
      right:
        this.nav.repoType === RepoTypeEnum.Session
          ? BuilderRightEnum.Sessions
          : BuilderRightEnum.Validation
    });
  }

  navigateExplorer() {
    if (this.explorerEnabled === false) {
      return;
    }

    if (this.isExplorerRouteActive === true) {
      return;
    }

    this.uiQuery.updatePart({ showSessionInput: false });
    this.sessionQuery.reset();
    this.sessionBundleQuery.reset();
    this.sessionEventsQuery.reset();

    this.navigateService.navigateToExplorer();
  }

  navigateCharts() {
    if (this.isModelsRouteActive === true) {
      return;
    }

    if (this.nav.needValidate === true) {
      this.navigateService.navigateToModels();
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
      this.spinner.show(APP_SPINNER_NAME);

      let payload: ToBackendCheckLastNavRequestPayload = {
        projectId: this.nav.projectId,
        repoId: this.nav.repoId,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        modelId: pModelLink.modelId,
        chartId: pChartLink.chartId
      };

      this.apiService
        .req({
          pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCheckLastNav,
          payload: payload,
          showSpinner: false
        })
        .pipe(
          tap((resp: ToBackendCheckLastNavResponse) => {
            if (
              resp.info?.status === ResponseInfoStatusEnum.Ok &&
              resp.payload.modelExists === true &&
              resp.payload.chartExists === true
            ) {
              this.navigateService.navigateToChart({
                modelId: pModelLink.modelId,
                chartId: pChartLink.chartId
              });
            } else {
              this.navigateService.navigateToModels();
            }
          }),
          take(1)
        )
        .subscribe();
    } else {
      this.navigateService.navigateToModels();
    }
  }

  navigateDashboards() {
    if (this.isDashboardsRouteActive === true) {
      return;
    }

    if (this.nav.needValidate === true) {
      this.navigateService.navigateToDashboardsList();
      return;
    }

    let projectDashboardLinks = this.uiQuery.getValue().projectDashboardLinks;
    let pLink = projectDashboardLinks.find(
      link => link.projectId === this.nav.projectId
    );

    if (isDefined(pLink?.dashboardId)) {
      this.spinner.show(APP_SPINNER_NAME);

      let payload: ToBackendCheckLastNavRequestPayload = {
        projectId: this.nav.projectId,
        repoId: this.nav.repoId,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        dashboardId: pLink.dashboardId
      };

      this.apiService
        .req({
          pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCheckLastNav,
          payload: payload,
          showSpinner: false
        })
        .pipe(
          tap((resp: ToBackendCheckLastNavResponse) => {
            if (
              resp.info?.status === ResponseInfoStatusEnum.Ok &&
              resp.payload.dashboardExists === true
            ) {
              this.navigateService.navigateToDashboard({
                dashboardId: pLink.dashboardId
              });
            } else {
              this.navigateService.navigateToDashboardsList();
            }
          }),
          take(1)
        )
        .subscribe();
    } else {
      this.navigateService.navigateToDashboardsList();
    }
  }

  navigateReports() {
    if (this.isReportsRouteActive === true) {
      return;
    }

    if (this.nav.needValidate === true) {
      this.navigateService.navigateToReportsList();
      return;
    }

    let projectReportLinks = this.uiQuery.getValue().projectReportLinks;

    let pLink = projectReportLinks.find(
      link => link.projectId === this.nav.projectId
    );

    if (isDefined(pLink) && pLink.reportId === EMPTY_REPORT_ID) {
      this.navigateService.navigateToReport({ reportId: EMPTY_REPORT_ID });
      return;
    }

    if (isDefined(pLink?.reportId)) {
      this.spinner.show(APP_SPINNER_NAME);

      let payload: ToBackendCheckLastNavRequestPayload = {
        projectId: this.nav.projectId,
        repoId: this.nav.repoId,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        reportId: pLink.reportId
      };

      this.apiService
        .req({
          pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCheckLastNav,
          payload: payload,
          showSpinner: false
        })
        .pipe(
          tap((resp: ToBackendCheckLastNavResponse) => {
            if (
              resp.info?.status === ResponseInfoStatusEnum.Ok &&
              resp.payload.reportExists === true
            ) {
              this.navigateService.navigateToReport({
                reportId: pLink.reportId
              });
            } else {
              this.navigateService.navigateToReportsList();
            }
          }),
          take(1)
        )
        .subscribe();
    } else {
      this.navigateService.navigateToReportsList();
    }
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs/operators';
import {
  EMPTY_REPORT_ID,
  PATH_BUILDER,
  PATH_DASHBOARDS,
  PATH_EXPLORER,
  PATH_MODELS,
  PATH_REPORTS
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Member } from '#common/types/backend/parts/member';
import type { ToBackendCheckLastNavOutput } from '#common/types/backend/routes/nav/check-last-nav/check-last-nav-output';
import type { ToBackendCheckLastNavRequest } from '#common/types/backend/routes/nav/check-last-nav/check-last-nav-request';
import type { BuilderRight } from '#common/types/front/builder/builder-right';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { SessionQuery, SessionState } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SpinnerService } from '#front/app/services/spinner.service';
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
    private spinnerService: SpinnerService,
    private router: Router,
    private navQuery: NavQuery,
    private repoQuery: RepoQuery,
    private sessionQuery: SessionQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private uiQuery: UiQuery,
    private memberQuery: MemberQuery,
    private apiService: ApiService,
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
      left: 'Tree',
      right:
        this.nav.repoType === 'session'
          ? ('Sessions' satisfies BuilderRight)
          : ('Validation' satisfies BuilderRight)
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
      let payload: ToBackendCheckLastNavRequest['input'] = {
        projectId: this.nav.projectId,
        repoId: this.nav.repoId,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        modelId: pModelLink.modelId,
        chartId: pChartLink.chartId
      };

      this.apiService
        .req({
          route: 'api/ToBackendCheckLastNav',
          payload: payload
        })
        .pipe(
          tap(resp => {
            if (resp.type === 'Success') {
              let output: ToBackendCheckLastNavOutput = resp.output;

              if (output.modelExists === true && output.chartExists === true) {
                this.navigateService.navigateToChart({
                  modelId: pModelLink.modelId,
                  chartId: pChartLink.chartId
                });

                return;
              }
            }

            this.navigateService.navigateToModels();
          }),
          take(1),
          this.spinnerService.appTrack()
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
      let payload: ToBackendCheckLastNavRequest['input'] = {
        projectId: this.nav.projectId,
        repoId: this.nav.repoId,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        dashboardId: pLink.dashboardId
      };

      this.apiService
        .req({
          route: 'api/ToBackendCheckLastNav',
          payload: payload
        })
        .pipe(
          tap(resp => {
            if (resp.type === 'Success') {
              let output: ToBackendCheckLastNavOutput = resp.output;

              if (output.dashboardExists === true) {
                this.navigateService.navigateToDashboard({
                  dashboardId: pLink.dashboardId
                });

                return;
              }
            }

            this.navigateService.navigateToDashboardsList();
          }),
          take(1),
          this.spinnerService.appTrack()
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
      let payload: ToBackendCheckLastNavRequest['input'] = {
        projectId: this.nav.projectId,
        repoId: this.nav.repoId,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        reportId: pLink.reportId
      };

      this.apiService
        .req({
          route: 'api/ToBackendCheckLastNav',
          payload: payload
        })
        .pipe(
          tap(resp => {
            if (resp.type === 'Success') {
              let output: ToBackendCheckLastNavOutput = resp.output;

              if (output.reportExists === true) {
                this.navigateService.navigateToReport({
                  reportId: pLink.reportId
                });

                return;
              }
            }

            this.navigateService.navigateToReportsList();
          }),
          take(1),
          this.spinnerService.appTrack()
        )
        .subscribe();
    } else {
      this.navigateService.navigateToReportsList();
    }
  }
}

import type { ConnectedPosition } from '@angular/cdk/overlay';
import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  type ElementRef,
  type OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
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

const topNavOverflowStageValues = [
  'none',
  'selectors',
  'pages',
  'branch'
] as const;

type TopNavOverflowStage = (typeof topNavOverflowStageValues)[number];

@Component({
  standalone: false,
  selector: 'm-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {
  isSideMenu = true;

  isTopNavOverflowOpen = false;

  topNavOverflowStage: TopNavOverflowStage = 'none';

  @ViewChild('navHeader', { static: true })
  private navHeaderRef: ElementRef<HTMLElement>;

  readonly topPopupPositions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 8
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 8
    }
  ];

  readonly topSelectorPopupPositions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 8
    }
  ];

  readonly sidePopupPositions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: 12
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetX: 12
    }
  ];

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
      this.isTopNavOverflowOpen = false;

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
    private cd: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {
    afterNextRender(() => {
      let navHeader: HTMLElement = this.navHeaderRef.nativeElement;

      let navContent: HTMLElement = navHeader.querySelector('.top-nav-content');

      let updateOverflow = (): void => {
        this.updateTopNavOverflow({ navHeader: navHeader });
      };

      let resizeObserver: ResizeObserver = new ResizeObserver(updateOverflow);

      let contentObserver: MutationObserver = new MutationObserver(
        updateOverflow
      );

      resizeObserver.observe(navHeader);

      contentObserver.observe(navContent, {
        childList: true,
        characterData: true,
        subtree: true
      });

      this.destroyRef.onDestroy(() => {
        resizeObserver.disconnect();
        contentObserver.disconnect();
      });
    });
  }

  ngOnInit() {
    this.checkUrls(this.router.url);
  }

  closeTopNavOverflow(item: { overflowButton: HTMLButtonElement }): void {
    let { overflowButton } = item;

    if (!this.isTopNavOverflowOpen) {
      return;
    }

    this.isTopNavOverflowOpen = false;

    overflowButton.focus();
  }

  private updateTopNavOverflow(item: { navHeader: HTMLElement }): void {
    let { navHeader } = item;

    if (this.isSideMenu) {
      return;
    }

    let pinnedControls: NodeListOf<HTMLElement> = navHeader.querySelectorAll(
      '.top-nav-logo, .top-nav-account'
    );

    let selectors: HTMLElement = navHeader.querySelector('.top-nav-selectors');

    let branch: HTMLElement = navHeader.querySelector('.rail-branch-slot');

    let pages: HTMLElement = navHeader.querySelector('.top-nav-pages');

    // Read the uncollapsed widths even when some controls are in the menu.
    navHeader.classList.add('top-nav-measuring');

    let stage: TopNavOverflowStage;

    try {
      let style: CSSStyleDeclaration = getComputedStyle(navHeader);

      let gap: number = parseFloat(style.columnGap);

      let availableWidth: number =
        navHeader.getBoundingClientRect().width -
        parseFloat(style.paddingInlineStart) -
        parseFloat(style.paddingInlineEnd);

      let pinnedWidth: number =
        Array.from(pinnedControls).reduce(
          (width, control) => width + control.getBoundingClientRect().width,
          0
        ) +
        pinnedControls.length * gap;

      let mainWidth: number =
        pinnedWidth +
        (isDefined(branch)
          ? branch.getBoundingClientRect().width +
            parseFloat(getComputedStyle(branch).marginInlineEnd) +
            gap
          : 0) +
        (isDefined(pages) ? pages.getBoundingClientRect().width + gap : 0);

      let selectorsWidth: number = selectors.getBoundingClientRect().width;

      let hamburgerWidth: number = parseFloat(
        style.getPropertyValue('--top-nav-row-height')
      );

      let minBranchWidth: number = parseFloat(
        style.getPropertyValue('--top-nav-branch-min-width')
      );

      if (mainWidth + selectorsWidth <= availableWidth) {
        stage = 'none';
      } else if (mainWidth + hamburgerWidth <= availableWidth) {
        stage = 'selectors';
      } else if (
        isDefined(branch) &&
        pinnedWidth + hamburgerWidth + minBranchWidth + gap > availableWidth
      ) {
        stage = 'branch';
      } else {
        stage = 'pages';
      }
    } finally {
      navHeader.classList.remove('top-nav-measuring');
    }

    if (this.topNavOverflowStage !== stage) {
      this.topNavOverflowStage = stage;
      this.isTopNavOverflowOpen = false;

      this.cd.detectChanges();
    }
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

              if (
                output.isModelExist === true &&
                output.isChartExist === true
              ) {
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

              if (output.isDashboardExist === true) {
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

              if (output.isReportExist === true) {
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

import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, from, interval, of } from 'rxjs';
import { concatMap, delay, filter, startWith, take, tap } from 'rxjs/operators';
import { DASHBOARDS_PAGE_TITLE } from '~common/constants/page-titles';
import {
  PATH_DASHBOARDS,
  PATH_DASHBOARDS_LIST,
  RESTRICTED_USER_ALIAS
} from '~common/constants/top';
import { REFRESH_LIST } from '~common/constants/top-front';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { getTimezones } from '~common/functions/get-timezones';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { Member } from '~common/interfaces/backend/member';
import { ModelX } from '~common/interfaces/backend/model-x';
import { ProjectDashboardLink } from '~common/interfaces/backend/project-dashboard-link';
import { Query } from '~common/interfaces/blockml/query';
import { RefreshItem } from '~common/interfaces/front/refresh-item';
import {
  ToBackendRunQueriesRequestPayload,
  ToBackendRunQueriesResponse
} from '~common/interfaces/to-backend/queries/to-backend-run-queries';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { FilteredDashboardsQuery } from '~front/app/queries/filtered-dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { StructDashboardResolver } from '~front/app/resolvers/struct-dashboard.resolver';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { UiService } from '~front/app/services/ui.service';

export class ModelXWithTotalDashboards extends ModelX {
  totalDashboards: number;
}

@Component({
  standalone: false,
  selector: 'm-dashboards',
  templateUrl: './dashboards.component.html'
})
export class DashboardsComponent implements OnInit, OnDestroy {
  @ViewChild('leftDashboardsContainer') leftDashboardsContainer!: ElementRef;

  isInitialScrollCompleted = false;

  restrictedUserAlias = RESTRICTED_USER_ALIAS;

  pageTitle = DASHBOARDS_PAGE_TITLE;

  dashboardsRunButtonSpinnerName = 'dashboardsRunButtonSpinnerName';

  pathDashboardsList = PATH_DASHBOARDS_LIST;
  pathDashboards = PATH_DASHBOARDS;

  showDashboardsLeftPanel = true;
  showDashboardsLeftPanel$ = this.uiQuery.showDashboardsLeftPanel$.pipe(
    tap(x => {
      this.showDashboardsLeftPanel = x;
    })
  );

  showTileParameters = false;
  showTileParameters$ = this.uiQuery.showTileParameters$.pipe(
    tap(x => {
      this.showTileParameters = x;
    })
  );

  timezoneForm = this.fb.group({
    timezone: [undefined]
  });

  timezones = getTimezones();

  struct$ = this.structQuery.select().pipe(
    tap(x => {
      if (x.allowTimezones === false) {
        this.timezoneForm.controls['timezone'].disable();
      } else {
        this.timezoneForm.controls['timezone'].enable();
      }
    })
  );

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

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

  filteredDraftsLength: number;

  dashboards: DashboardX[];
  dashboardsFilteredByWord: DashboardX[];
  filteredDashboards: DashboardX[];

  dashboards$ = this.dashboardsQuery.select().pipe(
    tap(x => {
      this.dashboards = x.dashboards;

      this.makeFilteredDashboards();
      this.cd.detectChanges();
    })
  );

  isRunButtonPressed = false;

  isCompleted = false;
  lastCompletedQuery: Query;

  refreshProgress = 0;
  refreshSubscription: Subscription;
  refreshId: string;

  isAutoRun = true;
  isAutoRun$ = this.uiQuery.isAutoRun$.pipe(
    tap(x => {
      this.isAutoRun = x;
      this.checkRefreshSelector();

      this.cd.detectChanges();
    })
  );

  dashboard: DashboardX;
  dashboard$ = this.dashboardQuery.select().pipe(
    tap(x => {
      this.dashboard = x;

      this.checkQueries();

      this.isAutoRun = this.uiQuery.getValue().isAutoRun;
      if (
        this.isAutoRun === true &&
        this.dashboard.dashboardId !== this.refreshId
      ) {
        this.refreshForm.controls.refresh.setValue(0);
        this.refreshChange();
      }
      this.checkAutoRun();

      this.cd.detectChanges();

      if (x.draft === false) {
        this.setProjectDashboardLink({
          dashboardId: this.dashboard.dashboardId
        });
      }
    })
  );

  word: string;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('?')[0].split('/');
      this.lastUrl = ar[ar.length - 1];
      this.cd.detectChanges();
    })
  );

  refreshForm = this.fb.group({
    refresh: [undefined]
  });

  refreshList: RefreshItem[] = REFRESH_LIST;

  runButtonTimerSubscription: Subscription;

  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private dashboardService: DashboardService,
    private structDashboardResolver: StructDashboardResolver,
    private structQuery: StructQuery,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private dashboardsQuery: DashboardsQuery,
    private filteredDashboardsQuery: FilteredDashboardsQuery,
    private dashboardQuery: DashboardQuery,
    private modelsQuery: ModelsQuery,
    private memberQuery: MemberQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private location: Location,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let ar = this.router.url.split('?')[0].split('/');
    this.lastUrl = ar[ar.length - 1];

    let uiState = this.uiQuery.getValue();

    this.timezoneForm.controls['timezone'].setValue(uiState.timezone);

    // this.searchWordChange();

    this.uiQuery.updatePart({
      showDashboardsLeftPanel: true,
      showTileParameters: false
    });

    setTimeout(() => {
      this.scrollToSelectedDashboard({ isSmooth: false });
    });
  }

  dashboardSaveAs(event: any) {
    event.stopPropagation();

    this.myDialogService.showDashboardSaveAs({
      apiService: this.apiService,
      dashboard: this.dashboard
    });
  }

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredDashboards();

      this.cd.detectChanges();
      // this.scrollToSelectedDashboard();
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredDashboards();

    this.cd.detectChanges();
    // this.scrollToSelectedDashboard();
  }

  makeFilteredDashboards() {
    let idxs;

    let draftDashboards = this.dashboards.filter(x => x.draft === true);
    let nonDraftDashboards = this.dashboards.filter(x => x.draft === false);

    if (isDefinedAndNotEmpty(this.word)) {
      let haystack = nonDraftDashboards.map(x =>
        isDefined(x.title) ? `${x.title}` : `${x.dashboardId}`
      );
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.word);
    }

    this.dashboardsFilteredByWord = isDefinedAndNotEmpty(this.word)
      ? idxs != null && idxs.length > 0
        ? idxs.map((idx: number): DashboardX => nonDraftDashboards[idx])
        : []
      : nonDraftDashboards;

    this.filteredDashboards = [
      ...draftDashboards,
      ...this.dashboardsFilteredByWord
    ];

    this.filteredDashboards = this.filteredDashboards.sort((a, b) => {
      let aTitle = a.title || a.dashboardId;
      let bTitle = b.title || b.dashboardId;

      return b.draft === true && a.draft !== true
        ? 1
        : a.draft === true && b.draft !== true
          ? -1
          : aTitle > bTitle
            ? 1
            : bTitle > aTitle
              ? -1
              : 0;
    });

    this.filteredDashboardsQuery.update({
      filteredDashboards: this.filteredDashboards
    });

    this.filteredDraftsLength = this.filteredDashboards.filter(
      y => y.draft === true
    ).length;
  }

  newDashboard() {
    this.myDialogService.shoCreateDashboard({
      apiService: this.apiService
    });
  }

  navToDashboard(dashboardId: string) {
    this.navigateService.navigateToDashboard({
      dashboardId: dashboardId
    });
  }

  navToDashboardsList() {
    if (this.lastUrl !== this.pathDashboardsList) {
      this.title.setTitle(this.pageTitle);

      this.navigateService.navigateToDashboardsList();
    }
  }

  deleteDrafts() {
    this.dashboardService.deleteDraftDashboards({
      dashboardIds: this.filteredDashboards
        .filter(d => d.draft === true)
        .map(d => d.dashboardId)
    });
  }

  deleteDraftDashboard(event: any, dashboard: DashboardX) {
    event.stopPropagation();

    this.dashboardService.deleteDraftDashboards({
      dashboardIds: [dashboard.dashboardId]
    });
  }

  timezoneChange() {
    (document.activeElement as HTMLElement).blur();

    let timezone = this.timezoneForm.controls['timezone'].value;

    this.uiQuery.updatePart({ timezone: timezone });
    this.uiService.setUserUi({ timezone: timezone });

    let uiState = this.uiQuery.getValue();

    if (isDefined(this.dashboard.dashboardId)) {
      this.structDashboardResolver
        .resolveRoute({
          dashboardId: this.dashboard.dashboardId,
          route: this.route.snapshot,
          showSpinner: true,
          timezone: uiState.timezone
        })
        .pipe(
          tap(x => {
            let uiStateB = this.uiQuery.getValue();

            let url = this.router
              .createUrlTree([], {
                relativeTo: this.route,
                queryParams: {
                  timezone: uiStateB.timezone.split('/').join('-')
                }
              })
              .toString();

            this.location.go(url);
          }),
          take(1)
        )
        .subscribe();
    }
  }

  timezoneSearchFn(term: string, timezone: { value: string; label: string }) {
    let haystack = [`${timezone.label}`];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  setProjectDashboardLink(item: { dashboardId: string }) {
    let { dashboardId } = item;

    let nav = this.navQuery.getValue();

    if (isUndefined(dashboardId) || isUndefined(nav.projectId)) {
      return;
    }

    let links = this.uiQuery.getValue().projectDashboardLinks;

    let link: ProjectDashboardLink = links.find(
      l => l.projectId === nav.projectId
    );

    if (link?.dashboardId === dashboardId) {
      return;
    }

    let newProjectDashboardLinks;

    if (isDefined(link)) {
      let newLink: ProjectDashboardLink = {
        projectId: nav.projectId,
        dashboardId: dashboardId,
        navTs: Date.now()
      };

      newProjectDashboardLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === nav.projectId))
      ];
    } else {
      let newLink: ProjectDashboardLink = {
        projectId: nav.projectId,
        dashboardId: dashboardId,
        navTs: Date.now()
      };

      newProjectDashboardLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectDashboardLinks = newProjectDashboardLinks.filter(
      l => l.navTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({
      projectDashboardLinks: newProjectDashboardLinks
    });
    this.uiService.setUserUi({
      projectDashboardLinks: newProjectDashboardLinks
    });
  }

  scrollToSelectedDashboard(item: { isSmooth: boolean }) {
    let { isSmooth } = item;

    if (this.dashboard && this.showDashboardsLeftPanel === true) {
      let selectedElement =
        this.leftDashboardsContainer.nativeElement.querySelector(
          `[dashboardId="${this.dashboard.dashboardId}"]`
        );

      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: isSmooth === true ? 'smooth' : 'auto',
          block: 'center'
        });
      }
    }

    if (this.isInitialScrollCompleted === false) {
      this.isInitialScrollCompleted = true;
      this.cd.detectChanges();
    }
  }

  addTile() {
    this.myDialogService.showDashboardAddTile({
      apiService: this.apiService,
      dashboard: this.dashboard
    });
  }

  editListeners() {
    this.myDialogService.showDashboardEditListeners({
      dashboardService: this.dashboardService,
      apiService: this.apiService,
      dashboard: this.dashboard
    });
  }

  toggleShowLeft() {
    this.showDashboardsLeftPanel = !this.showDashboardsLeftPanel;

    this.uiQuery.updatePart({
      showDashboardsLeftPanel: this.showDashboardsLeftPanel
    });
  }

  toggleShowTileParameters() {
    this.showTileParameters = !this.showTileParameters;

    this.uiQuery.updatePart({
      showTileParameters: this.showTileParameters
    });
  }

  toggleAutoRun() {
    let newIsAutoRunValue = !this.isAutoRun;

    this.isAutoRun = newIsAutoRunValue;
    this.checkAutoRun();

    this.uiQuery.updatePart({ isAutoRun: newIsAutoRunValue });
  }

  checkAutoRun() {
    // console.log('checkAutoRun');

    let newQueries = this.dashboard.tiles.filter(
      tile => isDefined(tile.query) && tile.query.status === QueryStatusEnum.New
    );

    if (this.isAutoRun === true && newQueries.length > 0) {
      setTimeout(() => {
        // console.log('checkAutoRun run');
        this.run();
      }, 0);
    }
  }

  checkRefreshSelector() {
    if (this.isAutoRun === false) {
      if (isDefined(this.refreshForm.controls.refresh.value)) {
        this.refreshForm.controls.refresh.setValue(undefined);
      }

      if (this.refreshForm.controls.refresh.enabled) {
        this.refreshForm.controls.refresh.disable();
      }

      this.refreshChange();
    } else if (this.isAutoRun === true) {
      if (isUndefined(this.refreshForm.controls.refresh.value)) {
        this.refreshForm.controls.refresh.setValue(0);
      }

      if (this.refreshForm.controls.refresh.disabled) {
        this.refreshForm.controls.refresh.enable();
      }
    }
  }

  refreshChange() {
    let refreshValueSeconds: number =
      this.refreshForm.controls['refresh'].value;

    this.refreshProgress = 0;

    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    this.refreshId = this.dashboard?.dashboardId;

    if (isUndefined(refreshValueSeconds) || refreshValueSeconds === 0) {
      return;
    }

    let intervalMs = refreshValueSeconds * 1000;

    let part = refreshValueSeconds >= 5 * 60 ? 1000 : 50;

    this.refreshSubscription = interval(part).subscribe(() => {
      this.refreshProgress = Math.min(
        this.refreshProgress + (part / intervalMs) * 100,
        100
      );

      if (this.refreshProgress >= 100) {
        this.refreshProgress = 0;

        // if (this.isRunButtonPressed === false) {
        this.run();
        // }
      }
    });
  }

  run() {
    this.startRunButtonTimer();

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(
        tap(x => {
          nav = x;
        }),
        take(1)
      )
      .subscribe();

    let payload: ToBackendRunQueriesRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: this.dashboard.tiles.map(tile => tile.mconfigId)
      // queryIds: this.dashboard.tiles.map(tile => tile.queryId)
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendRunQueriesResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let { runningQueries } = resp.payload;

            let newDashboard = Object.assign({}, this.dashboard, {
              tiles: this.dashboard.tiles.map(x => {
                let newTile = Object.assign({}, x);
                let query = runningQueries.find(q => q.queryId === x.queryId);
                newTile.query = query;
                return newTile;
              })
            });

            this.dashboardQuery.update(newDashboard);

            this.checkQueries();

            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  startRunButtonTimer() {
    this.isRunButtonPressed = true;
    this.spinner.show(this.dashboardsRunButtonSpinnerName);
    this.cd.detectChanges();

    this.runButtonTimerSubscription = from([0])
      .pipe(
        concatMap(v => of(v).pipe(delay(2000))),
        startWith(1),
        tap(x => {
          if (x === 0) {
            this.spinner.hide(this.dashboardsRunButtonSpinnerName);
            this.isRunButtonPressed = false;
            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  checkQueries() {
    let newQueriesLength = [
      ...this.dashboard.tiles.filter(
        r => isDefined(r.query) && r.query.status === QueryStatusEnum.New
      )
    ].map(r => r.query).length;

    let runningQueriesLength = [
      ...this.dashboard.tiles.filter(
        r => isDefined(r.query) && r.query.status === QueryStatusEnum.Running
      )
    ].map(r => r.query).length;

    let completedQueries = [
      ...this.dashboard.tiles.filter(
        r => isDefined(r.query) && r.query.status === QueryStatusEnum.Completed
      )
    ]
      .map(r => r.query)
      .sort((a, b) =>
        a.lastCompleteTs > b.lastCompleteTs
          ? 1
          : b.lastCompleteTs > a.lastCompleteTs
            ? -1
            : 0
      );

    if (
      newQueriesLength === 0 &&
      runningQueriesLength === 0 &&
      completedQueries.length > 0
    ) {
      this.isCompleted = true;
      this.lastCompletedQuery = completedQueries[completedQueries.length - 1];
    } else {
      this.isCompleted = false;
      this.lastCompletedQuery = undefined;
    }
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyDashboards')
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.refreshSubscription?.unsubscribe();
    this.runButtonTimerSubscription?.unsubscribe();
  }
}

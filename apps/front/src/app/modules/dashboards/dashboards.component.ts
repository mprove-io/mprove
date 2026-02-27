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
import { from, interval, of, Subscription } from 'rxjs';
import { concatMap, delay, filter, startWith, take, tap } from 'rxjs/operators';
import { DASHBOARDS_PAGE_TITLE } from '#common/constants/page-titles';
import {
  PATH_DASHBOARDS,
  PATH_DASHBOARDS_LIST,
  RESTRICTED_USER_ALIAS
} from '#common/constants/top';
import { REFRESH_LIST } from '#common/constants/top-front';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { getTimezones } from '#common/functions/get-timezones';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { makeTrackChangeId } from '#common/functions/make-track-change-id';
import { DashboardPart } from '#common/interfaces/backend/dashboard-part';
import { DashboardX } from '#common/interfaces/backend/dashboard-x';
import { Member } from '#common/interfaces/backend/member';
import { ModelX } from '#common/interfaces/backend/model-x';
import { Query } from '#common/interfaces/blockml/query';
import { RefreshItem } from '#common/interfaces/front/refresh-item';
import {
  ToBackendGetQueriesRequestPayload,
  ToBackendGetQueriesResponse
} from '#common/interfaces/to-backend/queries/to-backend-get-queries';
import {
  ToBackendRunQueriesRequestPayload,
  ToBackendRunQueriesResponse
} from '#common/interfaces/to-backend/queries/to-backend-run-queries';
import { DashboardQuery } from '#front/app/queries/dashboard.query';
import { DashboardPartsQuery } from '#front/app/queries/dashboard-parts.query';
import { DashboardPartsFilteredQuery } from '#front/app/queries/dashboard-parts-filtered.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { ModelsQuery } from '#front/app/queries/models.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { StructDashboardResolver } from '#front/app/resolvers/struct-dashboard.resolver';
import { ApiService } from '#front/app/services/api.service';
import { DashboardService } from '#front/app/services/dashboard.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

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
      if (x.mproveConfig.allowTimezones === false) {
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

  dashboardParts: DashboardPart[];
  dashboardPartsFilteredByWord: DashboardPart[];
  dashboardPartsFiltered: DashboardPart[];

  dashboardParts$ = this.dashboardPartsQuery.select().pipe(
    tap(x => {
      this.dashboardParts = x.dashboardParts;

      this.makeFilteredDashboards();
      this.cd.detectChanges();
    })
  );

  checkRunning$: Subscription;

  isRunButtonPressed = false;

  isCompleted = true;
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

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
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
        this.uiService.setProjectDashboardLink({
          dashboardId: this.dashboard.dashboardId
        });
      }
    })
  );

  word: string;

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
    private dashboardPartsQuery: DashboardPartsQuery,
    private dashboardPartsFilteredQuery: DashboardPartsFilteredQuery,
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

    this.uiQuery.updatePart({
      showDashboardsLeftPanel: true,
      showTileParameters: false
    });

    setTimeout(() => {
      this.scrollToSelectedDashboard({ isSmooth: false });
    });

    this.startCheckRunning();
  }

  startCheckRunning() {
    this.checkRunning$ = interval(3000)
      .pipe(
        concatMap(() => {
          if (this.isCompleted === false) {
            return this.getQueriesObservable();
          } else {
            return of(1);
          }
        })
      )
      .subscribe();
  }

  stopCheckRunning() {
    if (isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
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
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredDashboards();

    this.cd.detectChanges();
  }

  makeFilteredDashboards() {
    let idxs;

    let draftDashboards = this.dashboardParts.filter(x => x.draft === true);
    let nonDraftDashboards = this.dashboardParts.filter(x => x.draft === false);

    if (isDefinedAndNotEmpty(this.word)) {
      let haystack = nonDraftDashboards.map(x =>
        isDefined(x.title) ? `${x.title}` : `${x.dashboardId}`
      );
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.word);
    }

    this.dashboardPartsFilteredByWord = isDefinedAndNotEmpty(this.word)
      ? idxs != null && idxs.length > 0
        ? idxs.map((idx: number): DashboardPart => nonDraftDashboards[idx])
        : []
      : nonDraftDashboards;

    this.dashboardPartsFiltered = [
      ...draftDashboards,
      ...this.dashboardPartsFilteredByWord
    ];

    this.dashboardPartsFiltered = this.dashboardPartsFiltered.sort((a, b) => {
      let aTitle = (a.title || a.dashboardId).toUpperCase();
      let bTitle = (b.title || b.dashboardId).toUpperCase();

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

    this.dashboardPartsFilteredQuery.update({
      dashboardPartsFiltered: this.dashboardPartsFiltered
    });

    this.filteredDraftsLength = this.dashboardPartsFiltered.filter(
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
      dashboardIds: this.dashboardPartsFiltered
        .filter(x => x.draft === true)
        .map(x => x.dashboardId)
    });
  }

  deleteDraftDashboard(event: any, dashboardPart: DashboardPart) {
    event.stopPropagation();

    this.dashboardService.deleteDraftDashboards({
      dashboardIds: [dashboardPart.dashboardId]
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
          timezone: uiState.timezone,
          skipCache: true
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
    let newQueries = this.dashboard.tiles.filter(
      tile => isDefined(tile.query) && tile.query.status === QueryStatusEnum.New
    );

    if (this.isAutoRun === true && newQueries.length > 0) {
      setTimeout(() => {
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

      if (
        this.refreshForm.controls.refresh.disabled &&
        this.alias !== this.restrictedUserAlias
      ) {
        this.refreshForm.controls.refresh.enable();
      } else if (this.alias === this.restrictedUserAlias) {
        this.refreshForm.controls.refresh.disable();
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

        this.run();
      }
    });
  }

  run() {
    this.stopCheckRunning();

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
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: this.dashboard.tiles.map(tile => tile.mconfigId)
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
        tap(() => this.startCheckRunning()),
        take(1)
      )
      .subscribe();
  }

  getQueriesObservable() {
    let nav = this.navQuery.getValue();

    let mconfigIds = this.dashboard.tiles
      .filter(tile => tile.query?.status === QueryStatusEnum.Running)
      .map(tile => tile.mconfigId);

    if (mconfigIds.length === 0) {
      return of(1);
    }

    let payload: ToBackendGetQueriesRequestPayload = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: mconfigIds,
      skipData: false
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetQueries,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetQueriesResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let { queries } = resp.payload;

            let newDashboard = Object.assign({}, this.dashboard, {
              tiles: this.dashboard.tiles.map(x => {
                let query = queries.find(q => q.queryId === x.queryId);

                let newTile = Object.assign({}, x, {
                  query: isDefined(query) ? query : x.query,
                  trackChangeId:
                    isUndefined(query) ||
                    query.status === QueryStatusEnum.Running
                      ? x.trackChangeId
                      : makeTrackChangeId({
                          mconfig: x.mconfig,
                          query: query
                        })
                });
                return newTile;
              })
            });

            this.dashboardQuery.update(newDashboard);
            this.checkQueries();
            this.cd.detectChanges();
          }
        })
      );
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
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.refreshSubscription?.unsubscribe();
    this.runButtonTimerSubscription?.unsubscribe();

    this.stopCheckRunning();
  }
}

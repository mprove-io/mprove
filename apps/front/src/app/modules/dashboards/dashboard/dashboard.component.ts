import { Location } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { KtdGridLayout } from '@katoid/angular-grid-layout';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, from, fromEvent, merge, of } from 'rxjs';
import {
  concatMap,
  debounceTime,
  delay,
  filter,
  startWith,
  take,
  tap
} from 'rxjs/operators';
import { DeleteFilterFnItem } from '~front/app/interfaces/delete-filter-fn-item';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';
import { constants as frontConstants } from '~front/barrels/constants';

import { ActivatedRoute, Router } from '@angular/router';
import { UiQuery } from '~front/app/queries/ui.query';
import { StructDashboardResolver } from '~front/app/resolvers/struct-dashboard.resolver';
import { UiService } from '~front/app/services/ui.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { DashboardTileChartComponent } from '../../shared/dashboard-tile-chart/dashboard-tile-chart.component';

class LayoutItem {
  id: string;
  w: number;
  h: number;
  x: number;
  y: number;
  tile: common.TileX;
}

@Component({
  selector: 'm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  restrictedUserAlias = common.RESTRICTED_USER_ALIAS;

  pageTitle = frontConstants.DASHBOARD_PAGE_TITLE;

  dashboardRunButtonSpinnerName = 'dashboardRunButtonSpinnerName';

  // @ViewChild(KtdGridComponent, {static: true}) grid: KtdGridComponent;

  @ViewChild('scrollable') scrollable: any;

  @ViewChildren('chartRep')
  chartRepComponents: QueryList<DashboardTileChartComponent>;

  // @ViewChildren('chartRep', { read: ElementRef })
  // myItemElementRefs: QueryList<ElementRef>;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  randomId = common.makeId();

  scrollSpeed = 8;

  isRunButtonPressed = false;

  filtersIsExpanded = false;

  showBricks = false;

  isShow = true;

  isCompleted = false;
  firstCompletedQuery: common.Query;

  dashboard: common.DashboardX;
  dashboard$ = this.dashboardQuery.select().pipe(
    filter(x => common.isDefined(x.dashboardId)),
    tap(x => {
      this.dashboard = x;

      // console.log('this.dashboard.extendedFilters');
      // console.log(this.dashboard.extendedFilters);

      this.checkQueries();

      this.title.setTitle(
        `${this.pageTitle} - ${
          this.dashboard?.title || this.dashboard?.dashboardId
        }`
      );

      this.layout = this.dashboard.tiles.map(
        tile =>
          <LayoutItem>{
            id: tile.title,
            x: common.isDefined(tile.plateX)
              ? tile.plateX
              : common.TILE_DEFAULT_PLATE_X,
            y: common.isDefined(tile.plateY)
              ? tile.plateY
              : common.TILE_DEFAULT_PLATE_Y,
            w: common.isDefined(tile.plateWidth)
              ? tile.plateWidth
              : common.TILE_DEFAULT_PLATE_WIDTH,
            h: common.isDefined(tile.plateHeight)
              ? tile.plateHeight
              : common.TILE_DEFAULT_PLATE_HEIGHT,
            tile: tile
          }
      );

      this.cd.detectChanges();
    })
  );

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  compactType: any = 'vertical';
  preventCollision = false;
  cols = 24;
  rowHeight = 50;
  layout: LayoutItem[] = [];

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  deleteFilterFnBindThis = this.deleteFilterFn.bind(this);

  runButtonTimerSubscription: Subscription;

  private resizeSubscription: Subscription;
  private scrollSubscription: Subscription;

  constructor(
    private dashboardQuery: DashboardQuery,
    private userQuery: UserQuery,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
    private fb: FormBuilder,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private navigateService: NavigateService,
    private myDialogService: MyDialogService,
    private dashboardService: DashboardService,
    private spinner: NgxSpinnerService,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private structDashboardResolver: StructDashboardResolver,
    private location: Location,
    private cd: ChangeDetectorRef // @Inject(DOCUMENT) private _document: HTMLDocument,
  ) {}

  ngOnInit() {
    this.resizeSubscription = merge(
      fromEvent(window, 'resize'),
      fromEvent(window, 'orientationchange')
    )
      .pipe(debounceTime(500))
      .subscribe(() => this.preventHorizontalScrollWorkaround());

    this.preventHorizontalScrollWorkaround();
  }

  preventHorizontalScrollWorkaround() {
    setTimeout(() => {
      this.layout = [...this.layout];
    });

    // setTimeout(() => {
    //   this.refreshShow();
    // });
  }

  ngAfterViewInit() {
    if (common.isDefined(this.dashboard)) {
      this.scrollSubscription = merge(
        fromEvent(this.scrollable.nativeElement, 'scroll')
      )
        .pipe(debounceTime(100))
        .subscribe((event: any) => {
          this.randomId = common.makeId();
          this.cd.detectChanges();
        });
    }
  }

  toggleFiltersPanel() {
    this.filtersIsExpanded = !this.filtersIsExpanded;
  }

  trackByFn(index: number, item: any) {
    return item.tile.mconfigId;
  }

  goToFile() {
    let fileIdAr = this.dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  refreshShow() {
    // setTimeout(() => {
    //   this.chartRepComponents.forEach(x => {
    //     x.updateChartView();
    //   });
    // }, 0);
  }

  toggleShowTileFilters() {
    this.showBricks = !this.showBricks;
    this.refreshShow();
  }

  onResizeEnded(event: any) {
    this.dashboardQuery.update(
      Object.assign({}, this.dashboard, {
        temp: true
      })
    );
  }

  tileDeleted() {
    this.dashboardQuery.update(
      Object.assign({}, this.dashboard, {
        temp: true
      })
    );
  }

  tileQueryUpdated(query: common.Query, tileTitle: string) {
    let tile = this.dashboard.tiles.find(x => x.title === tileTitle);
    if (common.isDefined(tile) && tile.query.queryId === query.queryId) {
      tile.query = query;
    }

    this.checkQueries();
    this.cd.detectChanges();
  }

  checkQueries() {
    let completedQueries = [
      ...this.dashboard.tiles.filter(
        r =>
          common.isDefined(r.query) &&
          r.query.status === common.QueryStatusEnum.Completed
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

    if (completedQueries.length === this.dashboard.tiles.length) {
      this.isCompleted = true;
      this.firstCompletedQuery = completedQueries[0];
    } else {
      this.isCompleted = false;
      this.firstCompletedQuery = undefined;
    }
  }

  onDragStarted(event: any) {
    // this.preventCollision = true;
  }

  onDragEnded(event: any) {
    // this.preventCollision = false;
    this.dashboardQuery.update(
      Object.assign({}, this.dashboard, {
        temp: true
      })
    );
  }

  onLayoutUpdated(layout: KtdGridLayout) {
    // console.log('onLayoutUpdated', layout);

    let newDashboard = Object.assign({}, this.dashboard, {
      temp: true,
      tiles: this.dashboard.tiles.map((tile, i: number) => {
        tile.plateX = layout[i].x;
        tile.plateY = layout[i].y;
        tile.plateWidth = layout[i].w;
        tile.plateHeight = layout[i].h;

        return tile;
      })
    });

    this.dashboardQuery.update(newDashboard);

    this.refreshShow();
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

    let payload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      projectId: nav.projectId,
      queryIds: this.dashboard.tiles.map(tile => tile.queryId)
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendRunQueriesResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let { runningQueries } = resp.payload;

            this.dashboard.tiles = this.dashboard.tiles.map(x => {
              let newTile = Object.assign({}, x);
              let query = runningQueries.find(q => q.queryId === x.queryId);
              newTile.query = query;
              return newTile;
            });

            this.chartRepComponents.forEach(x => {
              x.showSpinner();
            });

            this.dashboard = Object.assign({}, this.dashboard);

            this.layout = this.dashboard.tiles.map(
              tile =>
                <LayoutItem>{
                  id: tile.title,
                  x: common.isDefined(tile.plateX)
                    ? tile.plateX
                    : common.TILE_DEFAULT_PLATE_X,
                  y: common.isDefined(tile.plateY)
                    ? tile.plateY
                    : common.TILE_DEFAULT_PLATE_Y,
                  w: common.isDefined(tile.plateWidth)
                    ? tile.plateWidth
                    : common.TILE_DEFAULT_PLATE_WIDTH,
                  h: common.isDefined(tile.plateHeight)
                    ? tile.plateHeight
                    : common.TILE_DEFAULT_PLATE_HEIGHT,
                  tile: tile
                }
            );

            this.checkQueries();
            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  editListeners() {
    this.myDialogService.showDashboardEditListeners({
      dashboardService: this.dashboardService,
      apiService: this.apiService,
      dashboard: this.dashboard
    });
  }

  saveAs() {
    this.myDialogService.showDashboardSaveAs({
      apiService: this.apiService,
      dashboard: this.dashboard
    });
  }

  addTile() {
    this.myDialogService.showDashboardAddTile({
      apiService: this.apiService,
      dashboard: this.dashboard
    });
  }

  addFilter() {
    this.filtersIsExpanded = true;

    this.myDialogService.showDashboardAddFilter({
      dashboardService: this.dashboardService,
      dashboard: this.dashboard,
      apiService: this.apiService
    });
  }

  startRunButtonTimer() {
    this.isRunButtonPressed = true;
    this.spinner.show(this.dashboardRunButtonSpinnerName);
    this.cd.detectChanges();

    this.runButtonTimerSubscription = from([0])
      .pipe(
        concatMap(v => of(v).pipe(delay(2000))),
        startWith(1),
        tap(x => {
          if (x === 0) {
            this.spinner.hide(this.dashboardRunButtonSpinnerName);
            this.isRunButtonPressed = false;
            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  deleteFilterFn(item: DeleteFilterFnItem) {
    let { filterFieldId, tileTitle } = item;

    this.dashboardService.editDashboard({
      isDraft: this.dashboard.draft,
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: this.dashboard.fields,
      deleteFilterFieldId: filterFieldId,
      deleteFilterTileTitle: tileTitle,
      timezone: this.uiQuery.getValue().timezone
    });
  }

  canDeactivate(): Promise<boolean> | boolean {
    // console.log('canDeactivateDashboard')
    this.dashboardQuery.reset();
    return true;
  }

  ngOnDestroy() {
    this.runButtonTimerSubscription?.unsubscribe();
    this.resizeSubscription?.unsubscribe();
    this.scrollSubscription?.unsubscribe();
  }
}

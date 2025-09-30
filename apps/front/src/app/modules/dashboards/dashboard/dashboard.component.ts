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
import { Title } from '@angular/platform-browser';
import { KtdGridLayout } from '@katoid/angular-grid-layout';
import { Subscription, fromEvent, merge } from 'rxjs';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { DASHBOARD_PAGE_TITLE } from '~common/constants/page-titles';
import {
  RESTRICTED_USER_ALIAS,
  TILE_DEFAULT_PLATE_HEIGHT,
  TILE_DEFAULT_PLATE_WIDTH,
  TILE_DEFAULT_PLATE_X,
  TILE_DEFAULT_PLATE_Y
} from '~common/constants/top';
import { PanelEnum } from '~common/enums/panel.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isDefined } from '~common/functions/is-defined';
import { makeId } from '~common/functions/make-id';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { TileX } from '~common/interfaces/backend/tile-x';
import { DeleteFilterFnItem } from '~common/interfaces/front/delete-filter-fn-item';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { DashboardTileChartComponent } from '../../shared/dashboard-tile-chart/dashboard-tile-chart.component';

class LayoutItem {
  id: string;
  w: number;
  h: number;
  x: number;
  y: number;
  tile: TileX;
}

@Component({
  standalone: false,
  selector: 'm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  restrictedUserAlias = RESTRICTED_USER_ALIAS;

  pageTitle = DASHBOARD_PAGE_TITLE;

  @ViewChild('scrollable') scrollable: any;

  @ViewChildren('chartRep')
  chartRepComponents: QueryList<DashboardTileChartComponent>;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  randomId = makeId();

  scrollSpeed = 8;

  filtersIsExpanded = false;

  isShow = false;

  TIMEOUT_MS = 0; // set >200 to solve previous version of right scroll padding (not needed now)

  showDashboardsLeftPanel = true;
  showDashboardsLeftPanel$ = this.uiQuery.showDashboardsLeftPanel$.pipe(
    tap(x => {
      if (this.showDashboardsLeftPanel !== x) {
        this.showDashboardsLeftPanel = x;

        this.isShow = false;
        this.cd.detectChanges();

        this.resetLayout({ setShowTrue: true });
      }
    })
  );

  showTileParameters = false;
  showTileParameters$ = this.uiQuery.showTileParameters$.pipe(
    tap(x => {
      this.showTileParameters = x;
    })
  );

  prevDashboardId: string;

  dashboard: DashboardX;
  dashboard$ = this.dashboardQuery.select().pipe(
    filter(x => isDefined(x.dashboardId)),
    tap(x => {
      this.dashboard = x;

      this.title.setTitle(
        `${this.pageTitle} - ${
          this.dashboard?.title || this.dashboard?.dashboardId
        }`
      );

      this.layout = this.dashboard.tiles.map(
        tile =>
          <LayoutItem>{
            id: tile.title,
            x: isDefined(tile.plateX) ? tile.plateX : TILE_DEFAULT_PLATE_X,
            y: isDefined(tile.plateY) ? tile.plateY : TILE_DEFAULT_PLATE_Y,
            w: isDefined(tile.plateWidth)
              ? tile.plateWidth
              : TILE_DEFAULT_PLATE_WIDTH,
            h: isDefined(tile.plateHeight)
              ? tile.plateHeight
              : TILE_DEFAULT_PLATE_HEIGHT,
            tile: tile
          }
      );

      // fixing of layout after nav to different dashboard
      if (
        isDefined(this.dashboard.dashboardId) &&
        isDefined(this.prevDashboardId) &&
        this.prevDashboardId !== this.dashboard.dashboardId
      ) {
        this.isShow = false;
        this.resetLayout({ setShowTrue: true, timeoutMs: this.TIMEOUT_MS });
      }

      this.prevDashboardId = this.dashboard.dashboardId;

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

  private resizeSubscription: Subscription;
  private scrollSubscription: Subscription;

  constructor(
    private dashboardQuery: DashboardQuery,
    private userQuery: UserQuery,
    private title: Title,
    private memberQuery: MemberQuery,
    private navigateService: NavigateService,
    private myDialogService: MyDialogService,
    private dashboardService: DashboardService,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef // @Inject(DOCUMENT) private _document: HTMLDocument,
  ) {}

  ngOnInit() {
    this.resizeSubscription = merge(
      fromEvent(window, 'resize'),
      fromEvent(window, 'orientationchange')
    )
      .pipe(debounceTime(500))
      .subscribe(() => this.resetLayout());

    this.resetLayout({ setShowTrue: true, timeoutMs: this.TIMEOUT_MS });
  }

  resetLayout(item?: { setShowTrue?: boolean; timeoutMs?: number }) {
    // layout workaround - prevents right padding on layout / horizontal scroll
    setTimeout(() => {
      this.layout = [...this.layout];

      if (isDefined(item?.setShowTrue)) {
        this.isShow = true;
      }

      this.cd.detectChanges();
    }, item?.timeoutMs || 0);
  }

  ngAfterViewInit() {
    if (isDefined(this.dashboard)) {
      this.scrollSubscription = merge(
        fromEvent(this.scrollable.nativeElement, 'scroll')
      )
        .pipe(debounceTime(100))
        .subscribe((event: any) => {
          this.randomId = makeId();
          this.cd.detectChanges();
        });
    }
  }

  toggleFiltersPanel() {
    this.filtersIsExpanded = !this.filtersIsExpanded;
  }

  goToFile() {
    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    let fileIdAr = this.dashboard.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath })
    });
  }

  onDragStarted(event: any) {
    // console.log('onDragStarted');
    // this.preventCollision = true;
  }

  onDragEnded(event: any) {
    // console.log('onDragEnded');
    // this.preventCollision = false;
  }

  onResizeEnded(event: any) {
    // console.log('onResizeEnded');
  }

  onLayoutUpdated(layout: KtdGridLayout) {
    // console.log('onLayoutUpdated', layout);

    let newDashboard = Object.assign({}, this.dashboard, {
      tiles: this.dashboard.tiles.map((tile, i: number) => {
        tile.plateX = layout[i].x;
        tile.plateY = layout[i].y;
        tile.plateWidth = layout[i].w;
        tile.plateHeight = layout[i].h;

        return tile;
      })
    });

    this.dashboardQuery.update(newDashboard);

    this.dashboardService.editDashboard({
      isDraft: this.dashboard.draft,
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: makeId(),
      newDashboardFields: this.dashboard.fields,
      timezone: this.uiQuery.getValue().timezone
    });
  }

  deleteTile(tileIndex: number) {
    let newTiles = [
      ...this.dashboard.tiles.slice(0, tileIndex),
      ...this.dashboard.tiles.slice(tileIndex + 1)
    ];

    this.dashboardQuery.updatePart({
      tiles: newTiles
    });

    this.dashboardService.editDashboard({
      isDraft: this.dashboard.draft,
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: makeId(),
      newDashboardFields: this.dashboard.fields,
      timezone: this.uiQuery.getValue().timezone
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

  deleteFilterFn(item: DeleteFilterFnItem) {
    let { filterFieldId, tileTitle } = item;

    let tile = this.dashboard.tiles.find(t => t.title === tileTitle);
    tile.deletedFilterFieldIds = [filterFieldId];

    if (isDefined(tile.listen[filterFieldId])) {
      delete tile.listen[filterFieldId];
    }

    this.dashboardService.editDashboard({
      isDraft: this.dashboard.draft,
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: makeId(),
      newDashboardFields: this.dashboard.fields,
      timezone: this.uiQuery.getValue().timezone
    });
  }

  trackByFn(index: number, item: { tile: TileX }) {
    return item.tile.trackChangeId;
  }

  ngOnDestroy() {
    this.resizeSubscription?.unsubscribe();
    this.scrollSubscription?.unsubscribe();
    //
    this.dashboardQuery.reset();
  }
}

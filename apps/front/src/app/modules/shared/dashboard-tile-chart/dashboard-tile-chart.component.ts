import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, interval, of } from 'rxjs';
import { concatMap, take, tap } from 'rxjs/operators';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { DeleteFilterFnItem } from '~front/app/interfaces/delete-filter-fn-item';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { DataService, QDataRow } from '~front/app/services/data.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { ChartViewComponent } from '../chart-view/chart-view.component';

@Component({
  selector: 'm-dashboard-tile-chart',
  templateUrl: './dashboard-tile-chart.component.html'
})
export class DashboardTileChartComponent implements OnInit, OnDestroy {
  chartTypeEnumTable = common.ChartTypeEnum.Table;
  queryStatusEnum = common.QueryStatusEnum;
  queryStatusRunning = common.QueryStatusEnum.Running;

  @ViewChildren('chartView') chartViewComponents: QueryList<ChartViewComponent>;

  @Input()
  tile: common.TileX;

  @Input()
  deleteFilterFn: (item: DeleteFilterFnItem) => void;

  @Input()
  title: string;

  @Input()
  dashboard: common.DashboardX;

  @Input()
  randomId: string;

  @Input()
  mconfig: common.MconfigX;

  @Input()
  query: common.Query;

  @Input()
  showBricks: boolean;

  @Input()
  isShow: boolean;

  @Output() repDeleted = new EventEmitter<string>();

  qData: QDataRow[];

  checkRunning$: Subscription;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  isSelectValid = false;

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private memberQuery: MemberQuery,
    private dataService: DataService,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private myDialogService: MyDialogService,
    private spinner: NgxSpinnerService,
    private dashboardQuery: DashboardQuery
  ) {}

  async ngOnInit() {
    // console.log(this.mconfig.queryId === this.query.queryId);

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

    this.qData =
      this.mconfig.queryId === this.query.queryId
        ? this.dataService.makeQData({
            data: this.query.data,
            columns: this.mconfig.fields
          })
        : [];

    this.checkRunning$ = interval(3000)
      .pipe(
        concatMap(() => {
          if (this.query?.status === common.QueryStatusEnum.Running) {
            let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
              projectId: nav.projectId,
              branchId: nav.branchId,
              envId: nav.envId,
              isRepoProd: nav.isRepoProd,
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId,
              dashboardId: this.dashboard.dashboardId
            };

            return this.apiService
              .req({
                pathInfoName:
                  apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                payload: payload
              })
              .pipe(
                tap((resp: apiToBackend.ToBackendGetQueryResponse) => {
                  if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
                    this.updateQuery(resp.payload.query);
                  }
                })
              );
          } else {
            return of(1);
          }
        })
      )
      .subscribe();

    let checkSelectResult = getSelectValid({
      chart: this.mconfig.chart,
      mconfigFields: this.mconfig.fields
    });

    this.isSelectValid = checkSelectResult.isSelectValid;
    // this.errorMessage = checkSelectResult.errorMessage;

    this.cd.detectChanges();
  }

  explore(event?: MouseEvent) {
    event.stopPropagation();

    if (this.tile.hasAccessToModel === true) {
      this.navigateService.navigateMconfigQuery({
        modelId: this.tile.modelId,
        mconfigId: this.tile.mconfigId,
        queryId: this.tile.queryId
      });
    }
  }

  updateChartView() {
    this.chartViewComponents.forEach(x => {
      x.updateChart();
    });
  }

  run(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }

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
      queryIds: [this.query.queryId]
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

            this.query = Object.assign(runningQueries[0], {
              sql: this.query.sql,
              data: this.query.data
            });

            this.spinner.show(this.tile.title);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteTile(event: MouseEvent) {
    event.stopPropagation();

    let deleteTileIndex = this.dashboard.tiles.findIndex(
      x => x.mconfigId === this.mconfig.mconfigId
    );

    let newTiles = [
      ...this.dashboard.tiles.slice(0, deleteTileIndex),
      ...this.dashboard.tiles.slice(deleteTileIndex + 1)
    ];

    this.repDeleted.emit();

    this.dashboardQuery.updatePart({
      tiles: newTiles,
      temp: true
    });
  }

  showChart() {
    this.myDialogService.showChart({
      updateQueryFn: this.updateQuery.bind(this),
      apiService: this.apiService,
      mconfig: this.mconfig,
      query: this.query,
      qData: this.qData,
      canAccessModel: this.tile.hasAccessToModel,
      showNav: true,
      isSelectValid: this.isSelectValid,
      dashboardId: this.dashboard.dashboardId,
      chartId: undefined,
      listen: this.tile.listen
    });
  }

  stopClick(event?: MouseEvent) {
    event.stopPropagation();
  }

  updateQuery(query: common.Query) {
    this.query = query;

    if (this.query.status !== common.QueryStatusEnum.Running) {
      this.spinner.hide(this.tile.title);
    }

    this.qData =
      this.mconfig.queryId === this.query.queryId
        ? this.dataService.makeQData({
            data: this.query.data,
            columns: this.mconfig.fields
          })
        : [];

    this.cd.detectChanges();
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyChart')
    if (common.isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }
}

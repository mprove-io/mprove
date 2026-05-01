import {
  ChangeDetectorRef,
  Component,
  Input,
  type OnChanges,
  type OnDestroy,
  type OnInit,
  type QueryList,
  type SimpleChanges,
  ViewChildren
} from '@angular/core';
import { interval, of, type Subscription } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeCopy } from '#common/functions/make-copy';
import { makeId } from '#common/functions/make-id';
import type { MconfigX } from '#common/zod/backend/mconfig-x';
import type { TileX } from '#common/zod/backend/tile-x';
import type { Query } from '#common/zod/blockml/query';
import type {
  ToBackendGetQueryRequestPayload,
  ToBackendGetQueryResponse
} from '#common/zod/to-backend/queries/to-backend-get-query';
import type {
  ToBackendRunQueriesRequestPayload,
  ToBackendRunQueriesResponse
} from '#common/zod/to-backend/queries/to-backend-run-queries';
import { getSelectValid } from '#front/app/functions/get-select-valid';
import { NavQuery, type NavState } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';
import { ChartService } from '#front/app/services/chart.service';
import { DataService, type QDataRow } from '#front/app/services/data.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import type { ChartViewComponent } from '../../shared/chart-view/chart-view.component';

@Component({
  standalone: false,
  selector: 'm-explorer-chart',
  templateUrl: './explorer-chart.component.html'
})
export class ExplorerChartComponent implements OnInit, OnChanges, OnDestroy {
  chartTypeEnumTable = ChartTypeEnum.Table;
  chartTypeEnumSingle = ChartTypeEnum.Single;
  chartTypeEnumLine = ChartTypeEnum.Line;
  chartTypeEnumScatter = ChartTypeEnum.Scatter;
  chartTypeEnumBar = ChartTypeEnum.Bar;

  queryStatusRunning = QueryStatusEnum.Running;

  modelTypeStore = ModelTypeEnum.Store;

  @ViewChildren('chartView') chartViewComponents: QueryList<ChartViewComponent>;

  @Input()
  tile: TileX;

  @Input()
  title: string;

  @Input()
  chartId: string;

  @Input()
  mconfig: MconfigX;

  @Input()
  query: Query;

  qData: QDataRow[];

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  isSelectValid = false;

  isFormat = true;

  checkRunning$: Subscription;

  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private chartService: ChartService,
    private dataService: DataService,
    private cd: ChangeDetectorRef,
    private myDialogService: MyDialogService
  ) {}

  ngOnInit() {
    this.updateChartData();

    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.query || changes.mconfig) {
      this.updateChartData();
    }
  }

  ngOnDestroy() {
    this.stopCheckRunning();
  }

  updateChartView() {
    this.chartViewComponents.forEach(x => {
      x.chartViewUpdateChart();
    });
  }

  showChart() {
    this.myDialogService.showChart({
      apiService: this.apiService,
      mconfig: this.mconfig,
      query: this.query,
      qData: this.qData,
      canAccessModel: this.tile.hasAccessToModel,
      showNav: true,
      isSelectValid: this.isSelectValid,
      listen: this.tile.listen,
      isToDuplicateQuery: true
    });
  }

  stopClick(item: { event?: MouseEvent }) {
    item.event?.stopPropagation();
  }

  toggleFormat() {
    this.isFormat = !this.isFormat;
  }

  run() {
    this.stopCheckRunning();

    let nav = this.navQuery.getValue();

    let payload: ToBackendRunQueriesRequestPayload = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: [this.mconfig.mconfigId]
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendRunQueriesResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let runningQuery = resp.payload.runningQueries[0];

            this.query = Object.assign(runningQuery, {
              sql: this.query.sql,
              data: this.query.data
            });

            this.updateChartData();
            this.startCheckRunning();
            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  startCheckRunning() {
    this.checkRunning$ = interval(3000)
      .pipe(
        concatMap(() => {
          if (this.query?.status === QueryStatusEnum.Running) {
            let nav = this.navQuery.getValue();

            let payload: ToBackendGetQueryRequestPayload = {
              projectId: nav.projectId,
              branchId: nav.branchId,
              envId: nav.envId,
              repoId: nav.repoId,
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId
            };

            return this.apiService.req({
              pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetQuery,
              payload: payload
            });
          }

          return of(undefined);
        }),
        tap((resp: ToBackendGetQueryResponse | undefined) => {
          if (resp?.info?.status === ResponseInfoStatusEnum.Ok) {
            this.query = resp.payload.query;
            this.updateChartData();

            if (this.query.status !== QueryStatusEnum.Running) {
              this.stopCheckRunning();
            }

            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  stopCheckRunning() {
    this.checkRunning$?.unsubscribe();
  }

  explore(item: { event?: MouseEvent }) {
    item.event?.stopPropagation();

    let newMconfigId = makeId();

    let mconfigCopy = makeCopy(this.mconfig);

    let newMconfig = Object.assign(mconfigCopy, <MconfigX>{
      mconfigId: newMconfigId,
      queryId: this.query.queryId,
      serverTs: 1
    });

    if (newMconfig.modelType === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        isKeepQueryId: true,
        isDraft: false,
        chartId: undefined,
        mconfig: newMconfig,
        queryOperation: {
          type: QueryOperationTypeEnum.Get,
          timezone: newMconfig.timezone
        }
      });
    } else {
      this.chartService.editChart({
        isKeepQueryId: true,
        isDraft: false,
        chartId: undefined,
        mconfig: newMconfig
      });
    }
  }

  private updateChartData() {
    this.qData =
      this.mconfig.queryId === this.query.queryId
        ? this.dataService.makeQData({
            query: this.query,
            mconfig: this.mconfig
          })
        : [];

    let checkSelectResult = getSelectValid({
      chart: this.mconfig.chart,
      mconfigFields: this.mconfig.fields,
      isStoreModel: this.mconfig.modelType === ModelTypeEnum.Store
    });

    this.isSelectValid = checkSelectResult.isSelectValid;
  }
}

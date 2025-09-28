import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { tap } from 'rxjs/operators';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { TileX } from '~common/interfaces/backend/tile-x';
import { Query } from '~common/interfaces/blockml/query';
import { DeleteFilterFnItem } from '~common/interfaces/front/delete-filter-fn-item';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { DataService, QDataRow } from '~front/app/services/data.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { ChartViewComponent } from '../chart-view/chart-view.component';

@Component({
  standalone: false,
  selector: 'm-dashboard-tile-chart',
  templateUrl: './dashboard-tile-chart.component.html'
})
export class DashboardTileChartComponent implements OnInit, OnChanges {
  chartTypeEnumTable = ChartTypeEnum.Table;
  chartTypeEnumSingle = ChartTypeEnum.Single;

  queryStatusEnum = QueryStatusEnum;
  queryStatusRunning = QueryStatusEnum.Running;

  modelTypeStore = ModelTypeEnum.Store;

  @ViewChildren('chartView') chartViewComponents: QueryList<ChartViewComponent>;

  @Input()
  deleteFilterFn: (item: DeleteFilterFnItem) => void;

  @Input()
  tile: TileX;

  @Input()
  title: string;

  @Input()
  dashboard: DashboardX;

  @Input()
  randomId: string;

  @Input()
  mconfig: MconfigX;

  @Input()
  query: Query;

  @Input()
  showTileParameters: boolean;

  qData: QDataRow[];

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
    private dashboardQuery: DashboardQuery,
    private dataService: DataService,
    private cd: ChangeDetectorRef,
    private myDialogService: MyDialogService,
    private spinner: NgxSpinnerService
  ) {}

  async ngOnInit() {
    // console.log(this.mconfig.queryId === this.query.queryId);

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
      // isStoreModel: this.mconfig.isStoreModel
    });

    this.isSelectValid = checkSelectResult.isSelectValid;
    // this.errorMessage = checkSelectResult.errorMessage;

    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.query?.currentValue?.status === QueryStatusEnum.Running &&
      (isUndefined(changes.query?.previousValue?.status) ||
        changes.query.previousValue.status !== QueryStatusEnum.Running)
    ) {
      this.spinner.show(this.tile.title);
    } else if (
      !!changes.query?.currentValue?.status &&
      changes.query?.currentValue?.status !== QueryStatusEnum.Running
    ) {
      this.spinner.hide(this.tile.title);
    }
  }

  updateChartView() {
    this.chartViewComponents.forEach(x => {
      x.chartViewUpdateChart();
    });
  }

  showChart() {
    this.myDialogService.showChart({
      // updateQueryFn: this.updateQuery.bind(this),
      apiService: this.apiService,
      mconfig: this.mconfig,
      query: this.query,
      qData: this.qData,
      canAccessModel: this.tile.hasAccessToModel,
      showNav: true,
      isSelectValid: this.isSelectValid,
      dashboardId: this.dashboard.dashboardId,
      chartId: undefined,
      listen: this.tile.listen,
      isToDuplicateQuery: true
    });
  }

  stopClick(event?: MouseEvent) {
    event.stopPropagation();
  }
}

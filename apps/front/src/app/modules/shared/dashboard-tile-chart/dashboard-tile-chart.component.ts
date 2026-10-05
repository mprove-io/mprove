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
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { TileX } from '#common/types/backend/parts/tile/tile-x';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { QueryStatus } from '#common/types/blockml/parts/query/query-status';
import type { DeleteFilterFnItem } from '#common/types/front/filter/delete-filter-fn-item';
import { getSelectValid } from '#front/app/functions/get-select-valid';
import { DashboardQuery } from '#front/app/queries/dashboard.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';
import { DataService, QDataRow } from '#front/app/services/data.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { ChartViewComponent } from '../chart-view/chart-view.component';

@Component({
  standalone: false,
  selector: 'm-dashboard-tile-chart',
  templateUrl: './dashboard-tile-chart.component.html'
})
export class DashboardTileChartComponent implements OnInit, OnChanges {
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
      isStoreModel: this.mconfig.modelType === 'Store'
    });

    this.isSelectValid = checkSelectResult.isSelectValid;

    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.query?.currentValue?.status ===
        ('Running' satisfies QueryStatus) &&
      (isUndefined(changes.query?.previousValue?.status) ||
        changes.query.previousValue.status !==
          ('Running' satisfies QueryStatus))
    ) {
      this.spinner.show(this.tile.title);
    } else if (
      !!changes.query?.currentValue?.status &&
      changes.query?.currentValue?.status !== ('Running' satisfies QueryStatus)
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

  stopClick(event?: MouseEvent) {
    event.stopPropagation();
  }
}

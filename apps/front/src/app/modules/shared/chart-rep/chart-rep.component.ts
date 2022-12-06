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
import { interval, of, Subscription } from 'rxjs';
import { startWith, switchMap, take, tap } from 'rxjs/operators';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService, RData } from '~front/app/services/query.service';
import { DashboardStore } from '~front/app/stores/dashboard.store';
import { NavState } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { ChartViewComponent } from '../chart-view/chart-view.component';

@Component({
  selector: 'm-chart-rep',
  templateUrl: './chart-rep.component.html'
})
export class ChartRepComponent implements OnInit, OnDestroy {
  chartTypeEnumTable = common.ChartTypeEnum.Table;
  queryStatusEnum = common.QueryStatusEnum;
  queryStatusRunning = common.QueryStatusEnum.Running;

  @ViewChildren('chartView') chartViewComponents: QueryList<ChartViewComponent>;

  @Input()
  report: common.ReportX;

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

  qData: RData[];

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
    private queryService: QueryService,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private myDialogService: MyDialogService,
    private spinner: NgxSpinnerService,
    private dashboardStore: DashboardStore
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
        ? this.queryService.makeQData({
            data: this.query.data,
            columns: this.mconfig.fields
          })
        : [];

    this.checkRunning$ = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => {
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

    if (this.report.hasAccessToModel === true) {
      this.navigateService.navigateMconfigQuery({
        modelId: this.report.modelId,
        mconfigId: this.report.mconfigId,
        queryId: this.report.queryId
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

            this.spinner.show(this.report.title);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteReport(event: MouseEvent) {
    event.stopPropagation();

    let deleteReportIndex = this.dashboard.reports.findIndex(
      x => x.mconfigId === this.mconfig.mconfigId
    );

    let newReports = [
      ...this.dashboard.reports.slice(0, deleteReportIndex),
      ...this.dashboard.reports.slice(deleteReportIndex + 1)
    ];

    this.repDeleted.emit();

    this.dashboardStore.update(
      Object.assign({}, this.dashboard, {
        reports: newReports,
        temp: true
      })
    );
  }

  showChart() {
    this.myDialogService.showChart({
      updateQueryFn: this.updateQuery.bind(this),
      apiService: this.apiService,
      mconfig: this.mconfig,
      query: this.query,
      qData: this.qData,
      canAccessModel: this.report.hasAccessToModel,
      showNav: true,
      isSelectValid: this.isSelectValid,
      dashboardId: this.dashboard.dashboardId,
      vizId: undefined
    });
  }

  stopClick(event?: MouseEvent) {
    event.stopPropagation();
  }

  updateQuery(query: common.Query) {
    this.query = query;

    if (this.query.status !== common.QueryStatusEnum.Running) {
      this.spinner.hide(this.report.title);
    }

    this.qData =
      this.mconfig.queryId === this.query.queryId
        ? this.queryService.makeQData({
            data: this.query.data,
            columns: this.mconfig.fields
          })
        : [];

    this.cd.detectChanges();
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyChartViz')
    if (common.isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }
}

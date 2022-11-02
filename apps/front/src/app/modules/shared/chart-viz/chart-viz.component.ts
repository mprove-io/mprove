import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
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
import { MemberState, MemberStore } from '~front/app/stores/member.store';
import { NavState } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-viz',
  templateUrl: './chart-viz.component.html'
})
export class ChartVizComponent implements OnInit, OnDestroy {
  chartTypeEnumTable = common.ChartTypeEnum.Table;
  queryStatusEnum = common.QueryStatusEnum;
  queryStatusRunning = common.QueryStatusEnum.Running;

  @Input()
  report: common.Report;

  @Input()
  title: string;

  @Input()
  viz: common.VizX;

  @Input()
  showBricks: boolean;

  @Input()
  vizDeletedFnBindThis: any;

  qData: RData[];
  query: common.Query;
  mconfig: common.MconfigX;

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
    private queryService: QueryService,
    private memberQuery: MemberQuery,
    private memberStore: MemberStore,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private myDialogService: MyDialogService,
    private spinner: NgxSpinnerService
  ) {}

  async ngOnInit() {
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

    let payloadGetViz: apiToBackend.ToBackendGetVizRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      vizId: this.viz.vizId
    };

    let query: common.Query;
    let mconfig: common.MconfigX;

    await this.apiService
      .req({
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetViz,
        payload: payloadGetViz
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetVizResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberStore.update(state =>
              Object.assign(resp.payload.userMember, <MemberState>{
                avatarSmall: state.avatarSmall
              })
            );
            query = resp.payload.viz.reports[0].query;
            mconfig = resp.payload.viz.reports[0].mconfig;
          }
        })
      )
      .toPromise();

    if (common.isUndefined(query)) {
      return;
    }

    this.qData =
      mconfig.queryId === query.queryId
        ? this.queryService.makeQData({
            data: query.data,
            columns: mconfig.fields
          })
        : [];

    this.query = query;
    this.mconfig = mconfig;

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
              vizId: this.viz.vizId
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
      chart: mconfig.chart,
      mconfigFields: this.mconfig.fields
    });

    this.isSelectValid = checkSelectResult.isSelectValid;
    // this.errorMessage = checkSelectResult.errorMessage;

    this.cd.detectChanges();
  }

  explore(event?: MouseEvent) {
    event.stopPropagation();

    if (this.viz.reports[0].hasAccessToModel === true) {
      this.navigateService.navigateMconfigQuery({
        modelId: this.report.modelId,
        mconfigId: this.report.mconfigId,
        queryId: this.report.queryId
      });
    }
  }

  run(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }

    this.spinner.show(this.viz.vizId);

    let payload: apiToBackend.ToBackendRunQueriesRequestPayload = {
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

            this.query = runningQueries[0];
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteViz(event?: MouseEvent) {
    event.stopPropagation();

    this.myDialogService.showDeleteViz({
      viz: this.viz,
      apiService: this.apiService,
      vizDeletedFnBindThis: this.vizDeletedFnBindThis,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd
    });
  }

  showChart() {
    this.myDialogService.showChart({
      updateQueryFn: this.updateQuery.bind(this),
      apiService: this.apiService,
      mconfig: this.mconfig,
      query: this.query,
      qData: this.qData,
      canAccessModel: this.viz.reports[0].hasAccessToModel,
      showNav: true,
      isSelectValid: this.isSelectValid,
      dashboardId: undefined,
      vizId: this.viz.vizId
    });
  }

  stopClick(event?: MouseEvent) {
    event.stopPropagation();
  }

  editVizInfo(event?: MouseEvent) {
    event.stopPropagation();

    this.myDialogService.showEditVizInfo({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      viz: this.viz,
      mconfig: this.mconfig
    });
  }

  goToFile(event?: MouseEvent) {
    event.stopPropagation();

    let fileIdAr = this.viz.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  updateQuery(query: common.Query) {
    this.query = query;

    if (this.query.status !== common.QueryStatusEnum.Running) {
      this.spinner.hide(this.viz.vizId);
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

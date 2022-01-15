import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { interval, of, Subscription } from 'rxjs';
import { map, startWith, switchMap, take, tap } from 'rxjs/operators';
import { checkAccessModel } from '~front/app/functions/check-access-model';
import { getColumnFields } from '~front/app/functions/get-column-fields';
import { getExtendedFilters } from '~front/app/functions/get-extended-filters';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService, RData } from '~front/app/services/query.service';
import { ModelStore } from '~front/app/stores/model.store';
import { MqStore } from '~front/app/stores/mq.store';
import { NavState } from '~front/app/stores/nav.store';
import { UiStore } from '~front/app/stores/ui.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { VizExtended } from '../../visualizations/visualizations.component';

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
  viz: VizExtended;

  @Input()
  showBricks: boolean;

  @Input()
  vizDeletedFnBindThis: any;

  accessRolesString: string;
  accessUsersString: string;
  accessString: string;

  author: string;

  sortedColumns: interfaces.ColumnField[];
  qData: RData[];
  query: common.Query;
  mconfig: common.Mconfig;
  model: common.Model;

  menuId = common.makeId();

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isVizOptionsMenuOpen = false;

  checkRunning$: Subscription;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  extendedFilters: interfaces.FilterExtended[];

  canAccessModel = false;

  isSelectValid = false;

  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private memberQuery: MemberQuery,
    private queryService: QueryService,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private myDialogService: MyDialogService,
    private spinner: NgxSpinnerService,
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    private mqStore: MqStore,
    private modelStore: ModelStore
  ) {}

  async ngOnInit() {
    let member: common.Member;
    this.memberQuery
      .select()
      .pipe(
        tap(x => {
          member = x;
        })
      )
      .subscribe();

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

    let payloadGetModel: apiToBackend.ToBackendGetModelRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      isRepoProd: nav.isRepoProd,
      modelId: this.report.modelId
    };

    let model: common.Model = await this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModel,
        payloadGetModel
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetModelResponse) => resp.payload.model
        )
      )
      .toPromise();

    let payloadGetMconfig: apiToBackend.ToBackendGetMconfigRequestPayload = {
      mconfigId: this.report.mconfigId
    };

    let mconfig: common.Mconfig = await this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMconfig,
        payloadGetMconfig
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetMconfigResponse) =>
            resp.payload.mconfig
        )
      )
      .toPromise();

    this.extendedFilters = getExtendedFilters({
      fields: model.fields,
      mconfig: mconfig
    });

    let payloadGetQuery: apiToBackend.ToBackendGetQueryRequestPayload = {
      mconfigId: this.report.mconfigId,
      queryId: this.report.queryId,
      vizId: this.viz.vizId
    };

    let query: common.Query = await this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
        payloadGetQuery
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetQueryResponse) => resp.payload.query
        )
      )
      .toPromise();

    this.sortedColumns = getColumnFields({
      mconfig: mconfig,
      fields: model.fields
    });

    this.qData =
      mconfig.queryId === query.queryId
        ? this.queryService.makeQData({
            data: query.data,
            columns: this.sortedColumns
          })
        : [];

    this.query = query;
    this.mconfig = mconfig;
    this.model = model;

    this.checkRunning$ = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (this.query?.status === common.QueryStatusEnum.Running) {
            let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId,
              vizId: this.viz.vizId
            };

            return this.apiService
              .req(
                apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                payload
              )
              .pipe(
                tap((resp: apiToBackend.ToBackendGetQueryResponse) => {
                  this.updateQuery(resp.payload.query);
                })
              );
          } else {
            return of(1);
          }
        })
      )
      .subscribe();

    this.canAccessModel = checkAccessModel({
      model: model,
      member: member
    });

    let checkSelectResult = getSelectValid({
      chart: mconfig.chart,
      sortedColumns: this.sortedColumns
    });

    this.isSelectValid = checkSelectResult.isSelectValid;
    // this.errorMessage = checkSelectResult.errorMessage;

    this.cd.detectChanges();
  }

  explore(event?: MouseEvent) {
    event.stopPropagation();
    // this.closeMenu();

    this.modelStore.update(this.model);

    this.mqStore.update(state =>
      Object.assign({}, state, { mconfig: this.mconfig, query: this.query })
    );

    if (this.canAccessModel === true) {
      this.navigateService.navigateMconfigQuery({
        modelId: this.report.modelId,
        mconfigId: this.report.mconfigId,
        queryId: this.report.queryId
      });
    }
  }

  openMenu() {
    this.isVizOptionsMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }
    this.isVizOptionsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu(event?: MouseEvent) {
    event.stopPropagation();
    if (this.isVizOptionsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  run(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
      this.closeMenu();
    }

    this.spinner.show(this.viz.vizId);

    let payload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      queryIds: [this.query.queryId]
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendRunQueriesResponse) => {
          let { runningQueries } = resp.payload;

          this.query = runningQueries[0];
        }),
        take(1)
      )
      .subscribe();
  }

  deleteViz(event?: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    this.myDialogService.showDeleteViz({
      viz: this.viz,
      apiService: this.apiService,
      vizDeletedFnBindThis: this.vizDeletedFnBindThis,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
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
      sortedColumns: this.sortedColumns,
      model: this.model,
      canAccessModel: this.canAccessModel,
      showNav: true,
      isSelectValid: this.isSelectValid
    });
  }

  stopClick(event?: MouseEvent) {
    event.stopPropagation();
  }

  editVizInfo(event?: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    this.myDialogService.showEditVizInfo({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
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
            columns: this.sortedColumns
          })
        : [];

    this.cd.detectChanges();
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyChartViz')
    if (common.isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }

    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}

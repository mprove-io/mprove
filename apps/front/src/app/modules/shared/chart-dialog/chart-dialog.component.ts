import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerService } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { Subscription, from, interval, of } from 'rxjs';
import { concatMap, delay, startWith, take, tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { ChartService } from '~front/app/services/chart.service';
import { DataService, QDataRow } from '~front/app/services/data.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { SharedModule } from '../shared.module';

export interface ChartDialogData {
  apiService: ApiService;
  isSelectValid: boolean;
  mconfig: common.MconfigX;
  query: common.Query;
  qData: QDataRow[];
  canAccessModel: boolean;
  showNav: boolean;
  chartId: string;
  dashboardId: string;
  isToDuplicateQuery: boolean;
  metricId?: string;
  listen?: { [a: string]: string };
  // updateQueryFn?: any;
}

@Component({
  selector: 'm-chart-dialog',
  templateUrl: './chart-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    UiSwitchModule,
    TippyDirective,
    SharedModule,
    NgScrollbarModule
  ]
})
export class ChartDialogComponent implements OnInit, OnDestroy {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  queryStatusRunning = common.QueryStatusEnum.Running;
  queryStatusCompleted = common.QueryStatusEnum.Completed;

  modelTypeStore = common.ModelTypeEnum.Store;

  title: string;

  groupByFieldForm: FormGroup;

  dimensionsPlusEmpty: common.ModelFieldY[] = [];
  fieldsListLoading = false;
  model: common.Model;

  chartDialogRunButtonSpinnerName = 'chartDialogRunButtonSpinnerName';

  isShowInit = true;
  isRunButtonPressed = false;

  chartTypeEnumTable = common.ChartTypeEnum.Table;
  chartTypeEnumLine = common.ChartTypeEnum.Line;
  chartTypeEnumScatter = common.ChartTypeEnum.Scatter;
  chartTypeEnumBar = common.ChartTypeEnum.Bar;

  isData = true;
  isFormat = true;
  showNav = false;

  checkRunning$: Subscription;

  canAccessModel: boolean;
  qData: QDataRow[];
  query: common.Query;
  mconfig: common.MconfigX;
  emptyGroupMconfig: common.MconfigX;
  isSelectValid = false;

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  runButtonTimerSubscription: Subscription;

  constructor(
    public ref: DialogRef<ChartDialogData>,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    private chartService: ChartService,
    private memberQuery: MemberQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private navigateService: NavigateService,
    private structQuery: StructQuery
  ) {}

  ngOnDestroy() {
    // console.log('ngOnDestroyChartDialog');
    this.runButtonTimerSubscription?.unsubscribe();

    if (common.isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }

  ngOnInit() {
    let nav = this.navQuery.getValue();

    this.title = this.ref.data.mconfig.chart?.title;

    this.groupByFieldForm = this.fb.group({
      groupByField: [undefined]
    });

    this.canAccessModel = this.ref.data.canAccessModel;
    this.showNav = this.ref.data.showNav;
    this.isSelectValid = this.ref.data.isSelectValid;

    if (this.ref.data.isToDuplicateQuery === true) {
      let oldMconfigId = this.ref.data.mconfig.mconfigId;

      let payload: apiToBackend.ToBackendDuplicateMconfigAndQueryRequestPayload =
        {
          projectId: nav.projectId,
          isRepoProd: nav.isRepoProd,
          branchId: nav.branchId,
          envId: nav.envId,
          oldMconfigId: oldMconfigId
        };

      let apiService = this.ref.data.apiService;

      apiService
        .req({
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum
              .ToBackendDuplicateMconfigAndQuery,
          payload: payload,
          showSpinner: true
        })
        .pipe(
          tap(
            (resp: apiToBackend.ToBackendDuplicateMconfigAndQueryResponse) => {
              if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
                let { mconfig, query } = resp.payload;

                this.mconfig = mconfig;
                this.emptyGroupMconfig = common.makeCopy(mconfig);
                this.query = query;

                this.qData =
                  this.mconfig.queryId === this.query.queryId
                    ? this.dataService.makeQData({
                        query: this.query,
                        mconfig: this.mconfig
                      })
                    : [];
              }

              this.isShowInit = false;
              this.cd.detectChanges();

              this.startCheckRunning();
            }
          ),
          take(1)
        )
        .subscribe();
    } else {
      this.isShowInit = false;

      this.mconfig = this.ref.data.mconfig;
      this.query = this.ref.data.query;
      this.qData = this.ref.data.qData;

      this.startCheckRunning();

      setTimeout(() => {
        (document.activeElement as HTMLElement).blur();
      }, 0);
    }
  }

  startCheckRunning() {
    this.checkRunning$ = interval(3000)
      .pipe(
        concatMap(() => {
          let nav = this.navQuery.getValue();

          if (this.query?.status === common.QueryStatusEnum.Running) {
            let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
              projectId: nav.projectId,
              branchId: nav.branchId,
              envId: nav.envId,
              isRepoProd: nav.isRepoProd,
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId,
              chartId: this.ref.data.chartId,
              dashboardId: this.ref.data.dashboardId
            };

            let apiService = this.ref.data.apiService;

            return apiService
              .req({
                pathInfoName:
                  apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                payload: payload
              })
              .pipe(
                tap((resp: apiToBackend.ToBackendGetQueryResponse) => {
                  if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
                    this.query = resp.payload.query;

                    this.qData =
                      this.mconfig.queryId === this.query.queryId
                        ? this.dataService.makeQData({
                            query: this.query,
                            mconfig: this.mconfig
                          })
                        : [];

                    this.cd.detectChanges();

                    // if (
                    //   common.isDefined(this.ref.data.updateQueryFn) &&
                    //   resp.payload.query.status !==
                    //     common.QueryStatusEnum.Running
                    // ) {
                    //   this.ref.data.updateQueryFn(resp.payload.query);
                    // }
                  }
                })
              );
          } else {
            return of(1);
          }
        })
      )
      .subscribe();
  }

  toggleData() {
    this.isData = !this.isData;
  }

  toggleFormat() {
    this.isFormat = !this.isFormat;
  }

  explore(event?: MouseEvent) {
    if (this.canAccessModel === false) {
      return;
    }

    this.ref.close();

    let newMconfigId = common.makeId();
    // let newQueryId = common.makeId();

    let mconfigCopy = common.makeCopy(this.mconfig);

    let newMconfig = Object.assign(mconfigCopy, <common.MconfigX>{
      mconfigId: newMconfigId,
      queryId: this.query.queryId,
      temp: true,
      serverTs: 1
    });

    if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isKeepQueryId: true,
        isDraft: false,
        chartId: undefined,
        queryOperation: {
          type: common.QueryOperationTypeEnum.Get,
          timezone: newMconfig.timezone
        }
      });
    } else {
      this.chartService.editChart({
        mconfig: newMconfig,
        isKeepQueryId: true,
        isDraft: false,
        chartId: undefined
      });
    }

    // this.navigateService.navigateMconfigQuery({
    //   modelId: this.mconfig.modelId,
    //   mconfigId: this.mconfig.mconfigId,
    //   queryId: this.query.queryId
    // });
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
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: [this.mconfig.mconfigId]
      // queryIds: [this.query.queryId]
    };

    let apiService = this.ref.data.apiService;

    apiService
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
          }
        }),
        take(1)
      )
      .subscribe();
  }

  goToModel(modelId: string, canAccessModel: boolean) {
    if (canAccessModel === false) {
      return;
    }

    this.ref.close();

    this.navigateService.navigateToChart({
      modelId: modelId,
      chartId: common.EMPTY_CHART_ID
    });
  }

  startRunButtonTimer() {
    this.isRunButtonPressed = true;
    this.spinner.show(this.chartDialogRunButtonSpinnerName);
    this.cd.detectChanges();

    this.runButtonTimerSubscription = from([0])
      .pipe(
        concatMap(v => of(v).pipe(delay(1000))),
        startWith(1),
        tap(x => {
          if (x === 0) {
            this.spinner.hide(this.chartDialogRunButtonSpinnerName);
            this.isRunButtonPressed = false;
            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  openGroupMetricBy() {
    let nav = this.navQuery.getValue();

    let metric = this.structQuery
      .getValue()
      .metrics.find(y => y.metricId === this.ref.data.metricId);

    let restrictedFilterFieldIds =
      metric.modelType === common.ModelTypeEnum.Malloy
        ? [
            `${metric.timeFieldId}_year`,
            `${metric.timeFieldId}_quarter`,
            `${metric.timeFieldId}_month`,
            `${metric.timeFieldId}_week`,
            `${metric.timeFieldId}_day`,
            `${metric.timeFieldId}_hour`,
            `${metric.timeFieldId}_minute`,
            `${metric.timeFieldId}_second`,
            `${metric.timeFieldId}_ts`
          ]
        : [
            `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Year}`,
            `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Quarter}`,
            `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Month}`,
            `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Week}`,
            `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Date}`,
            `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Hour}`,
            `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Minute}`,
            `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Time}`
          ];

    this.fieldsListLoading = true;

    let payload: apiToBackend.ToBackendGetModelRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: metric.modelId
    };

    let apiService = this.ref.data.apiService;

    let emptyField = Object.assign(
      {},
      common.makeCopy(constants.EMPTY_MCONFIG_FIELD),
      {
        partLabel: 'Empty'
      } as common.ModelFieldY
    );

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModel,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetModelResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.dimensionsPlusEmpty = [
              emptyField,
              ...resp.payload.model.fields
                .filter(
                  x =>
                    x.result !== common.FieldResultEnum.Ts &&
                    x.fieldClass === common.FieldClassEnum.Dimension &&
                    restrictedFilterFieldIds.indexOf(x.id) < 0
                )
                .map(x =>
                  Object.assign({}, x, {
                    partLabel: common.isDefined(x.groupLabel)
                      ? `${x.topLabel} ${x.groupLabel} ${x.label}`
                      : `${x.topLabel} ${x.label}`
                  } as common.ModelFieldY)
                )
                .sort((a, b) =>
                  a.partLabel > b.partLabel
                    ? 1
                    : b.partLabel > a.partLabel
                      ? -1
                      : 0
                )
            ];

            // console.log(this.fieldsList[0]);
            this.model = resp.payload.model;

            this.fieldsListLoading = false;
          }
        }),
        take(1)
      )
      .subscribe();
  }

  groupMetricByChange() {
    (document.activeElement as HTMLElement).blur();

    let nav = this.navQuery.getValue();

    let groupByFieldId = this.groupByFieldForm.controls['groupByField'].value;

    if (common.isDefined(groupByFieldId)) {
      let newMconfigId = common.makeId();
      let newQueryId = common.makeId();

      let mconfigCopy = common.makeCopy(this.emptyGroupMconfig);

      let newMconfig = Object.assign(mconfigCopy, <common.MconfigX>{
        mconfigId: newMconfigId,
        queryId: newQueryId,
        temp: true,
        serverTs: 1
      });

      newMconfig.select = [...newMconfig.select, groupByFieldId];

      newMconfig = common.setChartTitleOnSelectChange({
        mconfig: newMconfig,
        fields: this.model.fields
      });

      newMconfig = common.setChartFields({
        mconfig: newMconfig,
        fields: this.model.fields
      });

      newMconfig = common.sortChartFieldsOnSelectChange({
        mconfig: newMconfig,
        fields: this.model.fields
      });

      let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryRequestPayload =
        {
          projectId: nav.projectId,
          isRepoProd: nav.isRepoProd,
          branchId: nav.branchId,
          envId: nav.envId,
          mconfig: newMconfig,
          cellMetricsStartDateMs: undefined,
          cellMetricsEndDateMs: undefined
        };

      let apiService = this.ref.data.apiService;

      apiService
        .req({
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum
              .ToBackendCreateTempMconfigAndQuery,
          payload: payload
        })
        .pipe(
          tap(
            (resp: apiToBackend.ToBackendCreateTempMconfigAndQueryResponse) => {
              if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
                let { mconfig, query } = resp.payload;

                this.mconfig = mconfig;
                this.query = query;

                this.qData =
                  this.mconfig.queryId === this.query.queryId
                    ? this.dataService.makeQData({
                        query: this.query,
                        mconfig: this.mconfig
                      })
                    : [];

                if (this.query.status !== common.QueryStatusEnum.Completed) {
                  this.run();
                }
              }
            }
          ),
          take(1)
        )
        .subscribe();
    } else {
      let newMconfig = common.makeCopy(this.emptyGroupMconfig);

      let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
        projectId: nav.projectId,
        branchId: nav.branchId,
        envId: nav.envId,
        isRepoProd: nav.isRepoProd,
        mconfigId: newMconfig.mconfigId,
        queryId: newMconfig.queryId,
        chartId: undefined,
        dashboardId: undefined
      };

      let apiService = this.ref.data.apiService;

      apiService
        .req({
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
          payload: payload
        })
        .pipe(
          tap((resp: apiToBackend.ToBackendGetQueryResponse) => {
            if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
              this.mconfig = newMconfig;
              this.query = resp.payload.query;

              this.qData =
                this.mconfig.queryId === this.query.queryId
                  ? this.dataService.makeQData({
                      query: this.query,
                      mconfig: this.mconfig
                    })
                  : [];

              this.cd.detectChanges();
            }
          }),
          take(1)
        )
        .subscribe();
    }
  }

  filterMetricBySearchFn(term: string, modelFieldY: common.ModelFieldY) {
    let haystack = [
      common.isDefinedAndNotEmpty(modelFieldY.groupLabel)
        ? `${modelFieldY.topLabel} ${modelFieldY.groupLabel} - ${modelFieldY.label}`
        : `${modelFieldY.topLabel} ${modelFieldY.label}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }
}

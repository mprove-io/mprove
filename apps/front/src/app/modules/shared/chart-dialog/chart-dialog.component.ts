import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
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
import { from, interval, of, Subscription } from 'rxjs';
import { concatMap, delay, startWith, take, tap } from 'rxjs/operators';
import { EMPTY_CHART_ID, TRIPLE_UNDERSCORE } from '#common/constants/top';
import { EMPTY_MCONFIG_FIELD } from '#common/constants/top-front';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import { setChartFields } from '#common/functions/set-chart-fields/set-chart-fields';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { ToBackendDuplicateMconfigAndQueryRequest } from '#common/types/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-request';
import type { ToBackendDuplicateMconfigAndQueryResponse } from '#common/types/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-response';
import type { ToBackendGroupMetricByDimensionRequest } from '#common/types/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-request';
import type { ToBackendGroupMetricByDimensionResponse } from '#common/types/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-response';
import type { ToBackendGetModelRequest } from '#common/types/backend/routes/models/get-model/get-model-request';
import type { ToBackendGetModelResponse } from '#common/types/backend/routes/models/get-model/get-model-response';
import type { ToBackendGetQueryRequest } from '#common/types/backend/routes/queries/get-query/get-query-request';
import type { ToBackendGetQueryResponse } from '#common/types/backend/routes/queries/get-query/get-query-response';
import type { ToBackendRunQueriesRequest } from '#common/types/backend/routes/queries/run-queries/run-queries-request';
import type { ToBackendRunQueriesResponse } from '#common/types/backend/routes/queries/run-queries/run-queries-response';
import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelFieldY } from '#common/types/blockml/parts/model/model-field-y';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Timeframe } from '#common/types/shared/time/timeframe';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { ApiService } from '#front/app/services/api.service';
import { ChartService } from '#front/app/services/chart.service';
import { DataService, QDataRow } from '#front/app/services/data.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SharedModule } from '../shared.module';

export interface ChartDialogData {
  apiService: ApiService;
  isSelectValid: boolean;
  mconfig: MconfigX;
  query: Query;
  qData: QDataRow[];
  canAccessModel: boolean;
  showNav: boolean;
  isToDuplicateQuery: boolean;
  setPivotDefaults?: boolean;
  metricId?: string;
  listen?: { [a: string]: string };
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

  title: string;

  groupByFieldForm: FormGroup;

  dimensionsPlusEmpty: ModelFieldY[] = [];
  fieldsListLoading = false;
  model: Model;

  chartDialogRunButtonSpinnerName = 'chartDialogRunButtonSpinnerName';

  isShowInit = true;
  isRunButtonPressed = false;

  groupMetricChartType: ChartType = 'line';

  isData = true;
  isFormat = true;
  isGivens = false;
  showNav = false;

  checkRunning$: Subscription;

  canAccessModel: boolean;
  qData: QDataRow[];
  query: Query;
  mconfig: MconfigX;
  emptyGroupMconfig: MconfigX;
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
    this.runButtonTimerSubscription?.unsubscribe();

    if (isDefined(this.checkRunning$)) {
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

      let payload: ToBackendDuplicateMconfigAndQueryRequest['input'] = {
        projectId: nav.projectId,
        repoId: nav.repoId,
        branchId: nav.branchId,
        envId: nav.envId,
        oldMconfigId: oldMconfigId,
        setPivotDefaults: this.ref.data.setPivotDefaults
      };

      let apiService = this.ref.data.apiService;

      apiService
        .req({
          route: 'api/ToBackendDuplicateMconfigAndQuery',
          payload: payload,
          showSpinner: true
        })
        .pipe(
          tap((resp: ToBackendDuplicateMconfigAndQueryResponse) => {
            if (resp?.type === 'Success') {
              let { mconfig, query } = resp.output;

              this.mconfig = mconfig;
              this.emptyGroupMconfig = makeCopy(mconfig);
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
          }),
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

          if (this.query?.status === 'Running') {
            let payload: ToBackendGetQueryRequest['input'] = {
              projectId: nav.projectId,
              branchId: nav.branchId,
              envId: nav.envId,
              repoId: nav.repoId,
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId
            };

            let apiService = this.ref.data.apiService;

            return apiService
              .req({
                route: 'api/ToBackendGetQuery',
                payload: payload
              })
              .pipe(
                tap((resp: ToBackendGetQueryResponse) => {
                  if (resp?.type === 'Success') {
                    this.query = resp.output.query;

                    this.qData =
                      this.mconfig.queryId === this.query.queryId
                        ? this.dataService.makeQData({
                            query: this.query,
                            mconfig: this.mconfig
                          })
                        : [];

                    this.cd.detectChanges();
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

  toggleGivens() {
    this.isGivens = !this.isGivens;
  }

  get appliedGivensJson() {
    let appliedGivens = this.mconfig?.appliedGivens ?? {};

    return JSON.stringify(appliedGivens, null, 2);
  }

  explore(event?: MouseEvent) {
    if (this.isExplorer === false || this.canAccessModel === false) {
      return;
    }

    this.ref.close();

    let newMconfigId = makeId();

    let mconfigCopy = makeCopy(this.mconfig);

    let newMconfig = Object.assign(mconfigCopy, <MconfigX>{
      mconfigId: newMconfigId,
      queryId: this.query.queryId,
      serverTs: 1
    });

    if (newMconfig.modelType === 'Malloy') {
      this.chartService.editChart({
        isKeepQueryId: true,
        isDraft: false,
        chartId: undefined,
        mconfig: newMconfig,
        queryOperation: {
          type: 'Get',
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

    let payload: ToBackendRunQueriesRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: [this.mconfig.mconfigId]
    };

    let apiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendRunQueries',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendRunQueriesResponse) => {
          if (resp?.type === 'Success') {
            let { runningQueries } = resp.output;

            this.query = Object.assign(runningQueries[0], {
              sql: this.query.sql,
              data: this.query.data
            });

            this.cd.detectChanges();
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
      chartId: EMPTY_CHART_ID
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
      metric.modelType === 'Malloy'
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
            `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'year' satisfies Timeframe}`,
            `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'quarter' satisfies Timeframe}`,
            `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'month' satisfies Timeframe}`,
            `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'week' satisfies Timeframe}`,
            `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'date' satisfies Timeframe}`,
            `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'hour' satisfies Timeframe}`,
            `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'minute' satisfies Timeframe}`,
            `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'time' satisfies Timeframe}`
          ];

    this.fieldsListLoading = true;

    let payload: ToBackendGetModelRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: metric.modelId,
      getMalloy: false
    };

    let apiService = this.ref.data.apiService;

    let emptyField = Object.assign({}, makeCopy(EMPTY_MCONFIG_FIELD), {
      partLabel: 'Empty'
    } as ModelFieldY);

    apiService
      .req({
        route: 'api/ToBackendGetModel',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelResponse) => {
          if (resp?.type === 'Success') {
            this.dimensionsPlusEmpty = [
              emptyField,
              ...resp.output.model.fields
                .filter(
                  x =>
                    x.result !== 'ts' &&
                    x.fieldClass === 'dimension' &&
                    restrictedFilterFieldIds.indexOf(x.id) < 0
                )
                .map(x =>
                  Object.assign({}, x, {
                    partLabel: isDefined(x.groupLabel)
                      ? `${x.topLabel} ${x.groupLabel} ${x.label}`
                      : `${x.topLabel} ${x.label}`
                  } as ModelFieldY)
                )
                .sort((a, b) =>
                  a.partLabel > b.partLabel
                    ? 1
                    : b.partLabel > a.partLabel
                      ? -1
                      : 0
                )
            ];

            this.model = resp.output.model;

            this.fieldsListLoading = false;

            this.cd.detectChanges();
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

    if (isDefined(groupByFieldId)) {
      let payload: ToBackendGroupMetricByDimensionRequest['input'] = {
        projectId: nav.projectId,
        repoId: nav.repoId,
        branchId: nav.branchId,
        envId: nav.envId,
        timezone: this.emptyGroupMconfig.timezone,
        mconfigId: this.emptyGroupMconfig.mconfigId,
        groupByFieldId: groupByFieldId,
        cellMetricsStartDateMs: undefined,
        cellMetricsEndDateMs: undefined
      };

      let apiService = this.ref.data.apiService;

      apiService
        .req({
          route: 'api/ToBackendGroupMetricByDimension',
          payload: payload
        })
        .pipe(
          tap((resp: ToBackendGroupMetricByDimensionResponse) => {
            if (resp?.type === 'Success') {
              let { mconfig, query } = resp.output;

              this.mconfig = this.setGroupMetricChartType({
                mconfig: mconfig,
                newChartType: this.groupMetricChartType
              });
              this.query = query;

              this.qData =
                this.mconfig.queryId === this.query.queryId
                  ? this.dataService.makeQData({
                      query: this.query,
                      mconfig: this.mconfig
                    })
                  : [];

              this.cd.detectChanges();

              if (this.query.status !== 'Completed') {
                this.run();
              }
            }
          }),
          take(1)
        )
        .subscribe();
    } else {
      let newMconfig = this.setGroupMetricChartType({
        mconfig: makeCopy(this.emptyGroupMconfig),
        newChartType: this.groupMetricChartType
      });

      let payload: ToBackendGetQueryRequest['input'] = {
        projectId: nav.projectId,
        branchId: nav.branchId,
        envId: nav.envId,
        repoId: nav.repoId,
        mconfigId: newMconfig.mconfigId,
        queryId: newMconfig.queryId
      };

      let apiService = this.ref.data.apiService;

      apiService
        .req({
          route: 'api/ToBackendGetQuery',
          payload: payload
        })
        .pipe(
          tap((resp: ToBackendGetQueryResponse) => {
            if (resp?.type === 'Success') {
              this.mconfig = newMconfig;
              this.query = resp.output.query;

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

  groupMetricChartTypeChange(item: { newChartType: ChartType }) {
    let { newChartType } = item;

    (document.activeElement as HTMLElement).blur();

    if (this.groupMetricChartType === newChartType) {
      return;
    }

    this.groupMetricChartType = newChartType;

    let isMconfigDefined = isDefined(this.mconfig);
    if (isMconfigDefined === true) {
      this.mconfig = this.setGroupMetricChartType({
        mconfig: this.mconfig,
        newChartType: newChartType
      });

      this.cd.detectChanges();
    }
  }

  setGroupMetricChartType(item: {
    mconfig: MconfigX;
    newChartType: ChartType;
  }) {
    let { mconfig, newChartType } = item;

    let newMconfig = makeCopy(mconfig);
    let oldChartType = newMconfig.chart.type;
    newMconfig.chart.type = newChartType;

    newMconfig = setChartFields({
      oldChartType: oldChartType,
      newChartType: newChartType,
      mconfig: newMconfig,
      fields: newMconfig.fields
    });

    newMconfig.chart.series.forEach(s => (s.type = newChartType));

    return newMconfig;
  }

  filterMetricBySearchFn(term: string, modelFieldY: ModelFieldY) {
    let haystack = [
      isDefinedAndNotEmpty(modelFieldY.groupLabel)
        ? `${modelFieldY.topLabel} ${modelFieldY.groupLabel} - ${modelFieldY.label}`
        : `${modelFieldY.topLabel} ${modelFieldY.label}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }
}

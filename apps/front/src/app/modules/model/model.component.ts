import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, interval, of, Subscription } from 'rxjs';
import { filter, map, startWith, switchMap, take, tap } from 'rxjs/operators';
import { constants } from '~common/barrels/constants';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { selectChartFieldsOnChartTypeChange } from '~front/app/functions/select-chart-fields-on-chart-type-change';
import { ModelQuery } from '~front/app/queries/model.query';
import { ColumnField, MqQuery } from '~front/app/queries/mq.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { DataSizeService } from '~front/app/services/data-size.service';
import { FileService } from '~front/app/services/file.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService, RData } from '~front/app/services/query.service';
import { StructService } from '~front/app/services/struct.service';
import { TimeService } from '~front/app/services/time.service';
import { ValidationService } from '~front/app/services/validation.service';
import { ModelState } from '~front/app/stores/model.store';
import { MqState, MqStore } from '~front/app/stores/mq.store';
import { NavState } from '~front/app/stores/nav.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export class ChartTypeItem {
  label: string;
  value: common.ChartTypeEnum;
  iconPath: string;
}

@Component({
  selector: 'm-model',
  templateUrl: './model.component.html'
})
export class ModelComponent implements OnInit, OnDestroy {
  queryStatusEnum = common.QueryStatusEnum;
  connectionTypeEnum = common.ConnectionTypeEnum;
  chartTypeEnum = common.ChartTypeEnum;

  spinnerName = 'running';

  lastUrl: string;

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('/');
      this.lastUrl = ar[ar.length - 1];
      this.cd.detectChanges();
    })
  );

  mconfig: common.Mconfig;
  mconfig$ = this.mqQuery.mconfig$.pipe(
    tap(x => {
      this.mconfig = x;

      if (x.timezone) {
        this.timezoneForm.controls['timezone'].setValue(x.timezone);
      }

      if (x.limit) {
        this.limitForm.controls['limit'].setValue(x.limit);
      }

      if (x.chart) {
        this.chartTypeForm.controls['chartType'].setValue(x.chart.type);
        this.chartTitleForm.controls['chartTitle'].setValue(x.chart.title);
      }

      this.cd.detectChanges();
    })
  );

  query: common.Query;
  query$ = this.mqQuery.query$.pipe(
    tap(x => {
      this.query = x;
      this.dryQueryEstimate = undefined;

      if (this.query.status === common.QueryStatusEnum.Running) {
        this.spinner.show(this.spinnerName);
      } else {
        this.spinner.hide(this.spinnerName);
      }

      this.cd.detectChanges();
    })
  );

  isShow = true;

  filtersIsExpanded = false;
  chartIsExpanded = true;
  dataIsExpanded = true;

  isFormat = true;

  sqlIsShow = false;
  resultsIsShow = true;

  runSecondsAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => {
      let s = this.timeService.secondsAgoFromNow(
        this.query.lastRunTs + this.nav.serverTimeDiff
      );
      // console.log(this.query.lastRunTs);
      // console.log(this.nav.serverTimeDiff);
      return s > 0 ? s : 0;
    })
  );

  dryTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x =>
      this.timeService.timeAgoFromNow(
        this.dryQueryEstimate.lastRunDryTs + this.nav.serverTimeDiff
      )
    )
  );

  errorTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x =>
      this.timeService.timeAgoFromNow(
        this.query.lastErrorTs + this.nav.serverTimeDiff
      )
    )
  );

  canceledTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x =>
      this.timeService.timeAgoFromNow(
        this.query.lastCancelTs + this.nav.serverTimeDiff
      )
    )
  );

  completedTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x =>
      this.timeService.timeAgoFromNow(
        this.query.lastCompleteTs + this.nav.serverTimeDiff
      )
    )
  );

  checkRunning$: Subscription;

  struct$ = this.structQuery.select().pipe(
    tap(x => {
      if (x.allowTimezones === false) {
        this.timezoneForm.controls['timezone'].disable();
      } else {
        this.timezoneForm.controls['timezone'].enable();
      }
    })
  );

  timezoneForm = this.fb.group({
    timezone: [
      {
        value: undefined
      }
    ]
  });

  timezones = common
    .getTimezones()
    .filter(x => x.value !== constants.USE_PROJECT_TIMEZONE_VALUE);

  timeDiff: number;

  dryId: string;
  dryQueryEstimate: common.QueryEstimate;
  dryDataSize: string;

  sortedColumns: ColumnField[];
  qData: RData[];
  queryStatus: common.QueryStatusEnum;
  mconfigChart: common.Chart;

  isSelectValid = false;
  errorMessage = '';

  modelMconfigQueryLatest$ = combineLatest([
    this.modelQuery.fields$,
    this.mqQuery.mconfig$,
    this.mqQuery.query$
  ]).pipe(
    tap(
      ([fields, mconfig, query]: [
        common.ModelField[],
        common.Mconfig,
        common.Query
      ]) => {
        if (common.isUndefined(mconfig.mconfigId)) {
          return;
        }

        let { select, sortings, chart } = mconfig;

        if (select && fields) {
          let selectDimensions: ColumnField[] = [];
          let selectMeasures: ColumnField[] = [];
          let selectCalculations: ColumnField[] = [];

          select.forEach((fieldId: string) => {
            let field = fields.find(f => f.id === fieldId);
            let f: ColumnField = Object.assign({}, field, <ColumnField>{
              sorting: sortings.find(x => x.fieldId === fieldId),
              sortingNumber: sortings.findIndex(s => s.fieldId === fieldId),
              isHideColumn: chart?.hideColumns.indexOf(field.id) > -1
            });

            if (field.fieldClass === common.FieldClassEnum.Dimension) {
              selectDimensions.push(f);
            } else if (field.fieldClass === common.FieldClassEnum.Measure) {
              selectMeasures.push(f);
            } else if (field.fieldClass === common.FieldClassEnum.Calculation) {
              selectCalculations.push(f);
            }
          });

          let selectFields: ColumnField[] = [
            ...selectDimensions,
            ...selectMeasures,
            ...selectCalculations
          ];

          this.sortedColumns = selectFields;

          // console.log('query');
          // console.log(query);
          // console.log('mconfig');
          // console.log(mconfig);

          this.qData =
            mconfig.queryId === query.queryId
              ? this.queryService.makeQData({
                  data: query.data,
                  columns: selectFields
                })
              : [];

          this.queryStatus = query.status;
          this.mconfigChart = mconfig.chart;

          let checkSelectResult = getSelectValid({
            chartType: chart.type,
            sortedColumns: this.sortedColumns
          });

          this.isSelectValid = checkSelectResult.isSelectValid;
          this.errorMessage = checkSelectResult.errorMessage;

          this.cd.detectChanges();
        }
      }
    )
  );

  limitForm: FormGroup = this.fb.group({
    limit: [
      undefined,
      [
        Validators.required,
        ValidationService.integerOrEmptyValidator,
        Validators.min(1),
        Validators.max(500)
      ]
    ]
  });

  chartTypeForm: FormGroup = this.fb.group({
    chartType: [undefined]
  });

  chartTitleForm: FormGroup = this.fb.group({
    chartTitle: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  chartTypesList: ChartTypeItem[] = [
    {
      label: 'Table',
      value: common.ChartTypeEnum.Table,
      iconPath: 'assets/charts/table.svg'
    },
    {
      label: 'Bar Vertical',
      value: common.ChartTypeEnum.BarVertical,
      iconPath: 'assets/charts/bar_vertical.svg'
    },
    {
      label: 'Bar Vertical Grouped',
      value: common.ChartTypeEnum.BarVerticalGrouped,
      iconPath: 'assets/charts/bar_vertical_grouped.svg'
    },
    {
      label: 'Bar Vertical Stacked',
      value: common.ChartTypeEnum.BarVerticalStacked,
      iconPath: 'assets/charts/bar_vertical_stacked.svg'
    },
    {
      label: 'Bar Vertical Normalized',
      value: common.ChartTypeEnum.BarVerticalNormalized,
      iconPath: 'assets/charts/bar_vertical_normalized.svg'
    },
    {
      label: 'Bar Horizontal',
      value: common.ChartTypeEnum.BarHorizontal,
      iconPath: 'assets/charts/bar_horizontal.svg'
    },
    {
      label: 'Bar Horizontal Grouped',
      value: common.ChartTypeEnum.BarHorizontalGrouped,
      iconPath: 'assets/charts/bar_horizontal_grouped.svg'
    },
    {
      label: 'Bar Horizontal Stacked',
      value: common.ChartTypeEnum.BarHorizontalStacked,
      iconPath: 'assets/charts/bar_horizontal_stacked.svg'
    },
    {
      label: 'Bar Horizontal Normalized',
      value: common.ChartTypeEnum.BarHorizontalNormalized,
      iconPath: 'assets/charts/bar_horizontal_normalized.svg'
    },
    {
      label: 'Pie',
      value: common.ChartTypeEnum.Pie,
      iconPath: 'assets/charts/pie.svg'
    },
    {
      label: 'Pie Advanced',
      value: common.ChartTypeEnum.PieAdvanced,
      iconPath: 'assets/charts/pie_advanced.svg'
    },
    {
      label: 'Pie Grid',
      value: common.ChartTypeEnum.PieGrid,
      iconPath: 'assets/charts/pie_grid.svg'
    },
    {
      label: 'Line',
      value: common.ChartTypeEnum.Line,
      iconPath: 'assets/charts/line.svg'
    },
    {
      label: 'Area',
      value: common.ChartTypeEnum.Area,
      iconPath: 'assets/charts/area.svg'
    },
    {
      label: 'Area Stacked',
      value: common.ChartTypeEnum.AreaStacked,
      iconPath: 'assets/charts/area_stacked.svg'
    },
    {
      label: 'Area Normalized',
      value: common.ChartTypeEnum.AreaNormalized,
      iconPath: 'assets/charts/area_normalized.svg'
    },
    {
      label: 'Heat Map',
      value: common.ChartTypeEnum.HeatMap,
      iconPath: 'assets/charts/heat_map.svg'
    },
    {
      label: 'Tree Map',
      value: common.ChartTypeEnum.TreeMap,
      iconPath: 'assets/charts/tree_map.svg'
    },
    {
      label: 'Number Card',
      value: common.ChartTypeEnum.NumberCard,
      iconPath: 'assets/charts/number_card.svg'
    },
    {
      label: 'Gauge',
      value: common.ChartTypeEnum.Gauge,
      iconPath: 'assets/charts/gauge.svg'
    },
    {
      label: 'Gauge Linear',
      value: common.ChartTypeEnum.GaugeLinear,
      iconPath: 'assets/charts/gauge_linear.svg'
    }
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private modelQuery: ModelQuery,
    private mqQuery: MqQuery,
    public repoQuery: RepoQuery,
    public repoStore: RepoStore,
    private apiService: ApiService,
    public structStore: StructStore,
    public fileService: FileService,
    public navigateService: NavigateService,
    private mqStore: MqStore,
    private structService: StructService,
    private timeService: TimeService,
    private mconfigService: MconfigService,
    private structQuery: StructQuery,
    private dataSizeService: DataSizeService,
    private queryService: QueryService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.checkRunning$ = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (this.query?.status === common.QueryStatusEnum.Running) {
            let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId
            };

            return this.apiService
              .req(
                apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                payload
              )
              .pipe(
                tap((resp: apiToBackend.ToBackendGetQueryResponse) => {
                  this.mqStore.update((state: MqState) =>
                    Object.assign({}, state, { query: resp.payload.query })
                  );
                })
              );
          } else {
            return of(1);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.checkRunning$.unsubscribe();
  }

  toggleFormat() {
    this.isFormat = !this.isFormat;
  }

  toggleSql() {
    this.sqlIsShow = !this.sqlIsShow;
    if (this.resultsIsShow === false && this.sqlIsShow === false) {
      this.resultsIsShow = true;
    }
  }

  toggleResults() {
    this.resultsIsShow = !this.resultsIsShow;

    if (this.sqlIsShow === false && this.resultsIsShow === false) {
      setTimeout(() => (this.sqlIsShow = true));
    }

    if (this.sqlIsShow === true) {
      this.sqlIsShow = false;
      setTimeout(() => (this.sqlIsShow = true));
    }
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
    });
  }

  toggleFiltersPanel() {
    this.filtersIsExpanded = !this.filtersIsExpanded;
    this.refreshShow();
  }

  toggleChartPanel() {
    this.chartIsExpanded = !this.chartIsExpanded;
    this.refreshShow();
  }

  toggleDataPanel() {
    this.dataIsExpanded = !this.dataIsExpanded;
    this.refreshShow();
  }

  goToFile() {
    let fileIdAr = this.model.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  limitBlur() {
    let limit = this.limitForm.controls['limit'];

    let newMconfig = this.structService.makeMconfig();

    if (!this.limitForm.valid || Number(limit.value) === newMconfig.limit) {
      return;
    }

    newMconfig.limit = Number(limit.value);

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  timezoneChange() {
    let timezone = this.timezoneForm.controls['timezone'].value;

    let newMconfig = this.structService.makeMconfig();

    newMconfig.timezone = timezone;

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  run() {
    let payload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      queryIds: [this.query.queryId]
    };

    this.cd.detectChanges();

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendRunQueriesResponse) => {
          let { runningQueries } = resp.payload;

          this.mqStore.update((state: MqState) =>
            Object.assign({}, state, { query: runningQueries[0] })
          );
        }),
        take(1)
      )
      .subscribe();
  }

  runDry() {
    this.dryId = common.makeId();

    let payload: apiToBackend.ToBackendRunQueriesDryRequestPayload = {
      queryIds: [this.query.queryId],
      dryId: this.dryId
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendRunQueriesDryResponse) => {
          let { validQueryEstimates, errorQueries } = resp.payload;

          if (errorQueries.length > 0) {
            this.mqStore.update((state: MqState) =>
              Object.assign({}, state, { query: errorQueries[0] })
            );
          } else {
            this.dryDataSize = this.dataSizeService.getSize(
              validQueryEstimates[0].estimate
            );
            this.dryQueryEstimate = validQueryEstimates[0];
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    let payload: apiToBackend.ToBackendCancelQueriesRequestPayload = {
      queryIds: [this.query.queryId]
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCancelQueries,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendCancelQueriesResponse) => {
          let { queries } = resp.payload;
          // console.log(queries);

          this.mqStore.update((state: MqState) =>
            Object.assign({}, state, { query: queries[0] })
          );
        }),
        take(1)
      )
      .subscribe();
  }

  chartTypeChange() {
    let chartType = this.chartTypeForm.controls['chartType'].value;

    let newMconfig = this.structService.makeMconfig();

    let fields: common.ModelField[];
    this.modelQuery.fields$
      .pipe(
        tap(x => (fields = x)),
        take(1)
      )
      .subscribe();

    newMconfig = selectChartFieldsOnChartTypeChange({
      newMconfig: newMconfig,
      fields: fields
    });

    newMconfig.chart.type = chartType;

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  saveAs() {}

  chartTitleBlur() {
    let chartTitle = this.chartTitleForm.controls['chartTitle'].value;

    let newMconfig = this.structService.makeMconfig();

    if (!this.chartTitleForm.valid) {
      return;
    }

    newMconfig.chart.title = chartTitle;

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }
}

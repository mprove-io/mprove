import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { from, interval, of, Subscription } from 'rxjs';
import {
  concatMap,
  delay,
  filter,
  map,
  startWith,
  take,
  tap
} from 'rxjs/operators';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { setChartFields } from '~front/app/functions/set-chart-fields';
import { ModelQuery, ModelState } from '~front/app/queries/model.query';
import { MqQuery } from '~front/app/queries/mq.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { DataSizeService } from '~front/app/services/data-size.service';
import { FileService } from '~front/app/services/file.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService, RData } from '~front/app/services/query.service';
import { StructService } from '~front/app/services/struct.service';
import { TimeService } from '~front/app/services/time.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants as frontConstants } from '~front/barrels/constants';

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
  restrictedUserAlias = common.RESTRICTED_USER_ALIAS;

  pageTitle = frontConstants.MODEL_PAGE_TITLE;

  modelRunButtonSpinnerName = 'modelRunButtonSpinnerName';
  modelCancelButtonSpinnerName = 'modelCancelButtonSpinnerName';

  isRunButtonPressed = false;
  isCancelButtonPressed = false;

  queryStatusEnum = common.QueryStatusEnum;
  connectionTypeEnum = common.ConnectionTypeEnum;
  chartTypeEnum = common.ChartTypeEnum;

  lastUrl: string;

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
      this.title.setTitle(`${this.pageTitle} - ${this.model?.label}`);
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

  mconfig: common.MconfigX;
  query: common.Query;

  mq$ = this.mqQuery.select().pipe(
    tap(x => {
      this.dryQueryEstimate = undefined;

      let oldMconfig = this.mconfig;

      this.mconfig = x.mconfig;
      this.query = x.query;

      // console.log(this.mconfig);

      this.filtersIsExpanded =
        this.filtersIsExpanded === false
          ? false
          : this.mconfig.extendedFilters.length > 0;

      if (this.mconfig.timezone) {
        this.timezoneForm.controls['timezone'].setValue(this.mconfig.timezone);
      }

      if (this.mconfig.limit) {
        this.limitForm.controls['limit'].setValue(this.mconfig.limit);
      }

      if (this.mconfig.chart) {
        this.chartTypeForm.controls['chartType'].setValue(
          this.mconfig.chart.type
        );
        this.chartTitleForm.controls['chartTitle'].setValue(
          this.mconfig.chart.title
        );
      }

      if (
        common.isDefined(this.mconfig) &&
        common.isDefined(this.mconfig.fields) &&
        this.mconfig.mconfigId !== common.EMPTY_REP_ID
      ) {
        this.qData =
          this.mconfig.queryId === this.query.queryId
            ? this.queryService.makeQData({
                data: this.query.data,
                columns: this.mconfig.fields
              })
            : [];

        let checkSelectResult = getSelectValid({
          chart: this.mconfig.chart,
          mconfigFields: this.mconfig.fields
        });

        this.isSelectValid = checkSelectResult.isSelectValid;
        this.errorMessage = checkSelectResult.errorMessage;
      }

      if (
        common.isDefined(this.query.queryId) &&
        this.query.queryId !== common.EMPTY_REP_ID &&
        this.query.status === common.QueryStatusEnum.New &&
        this.isAutoRun === true
      ) {
        setTimeout(() => {
          // console.log('auto run');
          this.run();
        }, 0);
      }

      this.cd.detectChanges();

      // workaround to remove scrolls on filters list change
      let shouldRefresh = false;

      if (
        common.isDefined(oldMconfig) &&
        oldMconfig.mconfigId !== common.EMPTY_REP_ID
      ) {
        if (
          oldMconfig.extendedFilters.length !==
          this.mconfig.extendedFilters.length
        ) {
          shouldRefresh = true;
        } else {
          oldMconfig.extendedFilters.forEach(oldExtendedFilter => {
            let newExtendedFilter = this.mconfig.extendedFilters.find(
              z => z.fieldId === oldExtendedFilter.fieldId
            );

            if (common.isUndefined(newExtendedFilter)) {
              shouldRefresh = true;
            } else if (
              oldExtendedFilter.fractions.length !==
              newExtendedFilter.fractions.length
            ) {
              shouldRefresh = true;
            }
          });
        }
      }
      if (shouldRefresh === true) {
        setTimeout(() => {
          this.refreshShow();
        });
      }
      //
    })
  );

  isShow = true;

  filtersIsExpanded = true;
  chartIsExpanded = true;
  dataIsExpanded = true;

  isAutoRun = true;
  isFormat = true;

  sqlIsShow = false;
  resultsIsShow = true;

  dryTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x =>
      this.timeService.timeAgoFromNow(
        this.dryQueryEstimate.lastRunDryTs + this.nav.serverTimeDiff
      )
    )
  );

  checkRunning$: Subscription;

  runButtonTimerSubscription: Subscription;
  cancelButtonTimerSubscription: Subscription;

  struct$ = this.structQuery.select().pipe(
    tap(x => {
      if (x.allowTimezones === false) {
        this.timezoneForm.controls['timezone'].disable();
      } else {
        this.timezoneForm.controls['timezone'].enable();
      }
    })
  );

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
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
    .filter(x => x.value !== common.USE_PROJECT_TIMEZONE_VALUE);

  timeDiff: number;

  dryId: string;
  dryQueryEstimate: common.QueryEstimate;
  dryDataSize: string;

  qData: RData[];

  isSelectValid = false;
  errorMessage = '';

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
    private userQuery: UserQuery,
    private mqQuery: MqQuery,
    private repoQuery: RepoQuery,
    private apiService: ApiService,
    private structQuery: StructQuery,
    private fileService: FileService,
    private navigateService: NavigateService,
    private structService: StructService,
    private spinner: NgxSpinnerService,
    private timeService: TimeService,
    private mconfigService: MconfigService,
    private dataSizeService: DataSizeService,
    private queryService: QueryService,
    private myDialogService: MyDialogService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

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

    this.checkRunning$ = interval(3000)
      .pipe(
        concatMap(() => {
          if (this.query?.status === common.QueryStatusEnum.Running) {
            let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
              projectId: nav.projectId,
              isRepoProd: nav.isRepoProd,
              branchId: nav.branchId,
              envId: nav.envId,
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId
            };

            return this.apiService
              .req({
                pathInfoName:
                  apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                payload: payload
              })
              .pipe(
                tap((resp: apiToBackend.ToBackendGetQueryResponse) => {
                  if (
                    resp.info?.status === common.ResponseInfoStatusEnum.Ok &&
                    this.isQueryIdTheSameAndServerTsChanged(resp.payload.query)
                  ) {
                    this.mqQuery.updatePart({ query: resp.payload.query });
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

  toggleAutoRun() {
    this.isAutoRun = !this.isAutoRun;
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

  expandFiltersPanel() {
    if (this.filtersIsExpanded === false) {
      this.toggleFiltersPanel();
    }
  }

  expandDataPanel() {
    if (this.dataIsExpanded === false) {
      this.toggleDataPanel();
    }
  }

  toggleFiltersPanel() {
    this.filtersIsExpanded = !this.filtersIsExpanded;
    if (this.mconfig.extendedFilters.length !== 0) {
      this.refreshShow();
    }
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
      panel: common.PanelEnum.Tree,
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

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  timezoneChange() {
    let timezone = this.timezoneForm.controls['timezone'].value;

    let newMconfig = this.structService.makeMconfig();

    newMconfig.timezone = timezone;

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
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

            if (this.isQueryIdTheSameAndServerTsChanged(runningQueries[0])) {
              let query = Object.assign(runningQueries[0], {
                sql: this.query.sql,
                data: this.query.data
              });

              this.mqQuery.updatePart({ query: query });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  runDry() {
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

    this.dryId = common.makeId();

    let payload: apiToBackend.ToBackendRunQueriesDryRequestPayload = {
      projectId: nav.projectId,
      queryIds: [this.query.queryId],
      dryId: this.dryId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendRunQueriesDryResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let { validQueryEstimates, errorQueries } = resp.payload;

            if (errorQueries.length > 0) {
              if (this.isQueryIdTheSameAndServerTsChanged(errorQueries[0])) {
                this.mqQuery.updatePart({ query: errorQueries[0] });
              }
            } else {
              this.dryDataSize = this.dataSizeService.getSize(
                validQueryEstimates[0].estimate
              );
              this.dryQueryEstimate = validQueryEstimates[0];
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.startCancelButtonTimer();

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

    let payload: apiToBackend.ToBackendCancelQueriesRequestPayload = {
      projectId: nav.projectId,
      queryIds: [this.query.queryId]
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCancelQueries,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCancelQueriesResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let { queries } = resp.payload;
            if (
              queries.length > 0 &&
              this.isQueryIdTheSameAndServerTsChanged(queries[0])
            ) {
              this.mqQuery.updatePart({ query: queries[0] });
            }
          }
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

    newMconfig = setChartFields({
      newMconfig: newMconfig,
      fields: fields
    });

    newMconfig.chart.type = chartType;

    this.mconfigService.optimisticNavCreateTempMconfig({
      newMconfig: newMconfig
    });
  }

  saveAs() {
    this.myDialogService.showChartSaveAs({
      apiService: this.apiService,
      mconfig: this.mconfig,
      model: this.model,
      query: this.query
    });
  }

  showChart(event?: MouseEvent) {
    event.stopPropagation();

    this.myDialogService.showChart({
      apiService: this.apiService,
      mconfig: this.mconfig,
      query: this.query,
      qData: this.qData,
      canAccessModel: true,
      showNav: false,
      isSelectValid: this.isSelectValid,
      dashboardId: undefined,
      vizId: undefined
    });
  }

  chartTitleBlur() {
    let chartTitle = this.chartTitleForm.controls['chartTitle'].value;

    let newMconfig = this.structService.makeMconfig();

    if (!this.chartTitleForm.valid || chartTitle === newMconfig.chart.title) {
      return;
    }

    newMconfig.chart.title = chartTitle;

    this.mconfigService.optimisticNavCreateTempMconfig({
      newMconfig: newMconfig
    });
  }

  isQueryIdTheSameAndServerTsChanged(respQuery: common.Query) {
    let query: common.Query;
    this.mqQuery
      .select()
      .pipe(
        tap(x => {
          query = x.query;
        }),
        take(1)
      )
      .subscribe();

    return (
      respQuery.queryId === query.queryId &&
      respQuery.serverTs !== query.serverTs
    );
  }

  startRunButtonTimer() {
    this.isRunButtonPressed = true;
    this.spinner.show(this.modelRunButtonSpinnerName);
    this.cd.detectChanges();

    this.runButtonTimerSubscription = from([0])
      .pipe(
        concatMap(v => of(v).pipe(delay(1000))),
        startWith(1),
        tap(x => {
          if (x === 0) {
            this.spinner.hide(this.modelRunButtonSpinnerName);
            this.isRunButtonPressed = false;
            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  startCancelButtonTimer() {
    this.isCancelButtonPressed = true;
    this.spinner.show(this.modelCancelButtonSpinnerName);
    this.cd.detectChanges();

    this.runButtonTimerSubscription = from([0])
      .pipe(
        concatMap(v => of(v).pipe(delay(1000))),
        startWith(1),
        tap(x => {
          if (x === 0) {
            this.spinner.hide(this.modelCancelButtonSpinnerName);
            this.isCancelButtonPressed = false;
            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  canDeactivate(): Promise<boolean> | boolean {
    // console.log('canDeactivateModel')
    this.mqQuery.reset();
    this.modelQuery.reset();
    return true;
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyModel')
    this.runButtonTimerSubscription?.unsubscribe();
    this.cancelButtonTimerSubscription?.unsubscribe();

    if (common.isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }
}

import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, from, interval, of } from 'rxjs';
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
import { ModelQuery, ModelState } from '~front/app/queries/model.query';
import { MqQuery } from '~front/app/queries/mq.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { DataSizeService } from '~front/app/services/data-size.service';
import { QDataRow } from '~front/app/services/data.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { StructService } from '~front/app/services/struct.service';
import { TimeService } from '~front/app/services/time.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants as frontConstants } from '~front/barrels/constants';

import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ChartsQuery } from '~front/app/queries/charts.query';
import { FilteredChartsQuery } from '~front/app/queries/filtered-charts.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { DataService } from '~front/app/services/data.service';
import { UiService } from '~front/app/services/ui.service';

export class RequestPartTypeItem {
  label: string;
  value: common.RequestPartTypeEnum;
}

export class ChartTypeItem {
  label: string;
  value: common.ChartTypeEnum;
  iconPath: string;
}

@Component({
  selector: 'm-charts',
  templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit, OnDestroy {
  @ViewChild('requestPartTypeSelect', { static: false })
  requestPartTypeSelectElement: NgSelectComponent;

  @ViewChild('chartTypeSelect', { static: false })
  chartTypeSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.requestPartTypeSelectElement?.close();
    this.chartTypeSelectElement?.close();
  }

  pageTitle = frontConstants.MODEL_PAGE_TITLE;

  pathCharts = common.PATH_CHARTS;
  pathChartsList = common.PATH_CHARTS_LIST;
  pathModelsList = common.PATH_MODELS_LIST;

  restrictedUserAlias = common.RESTRICTED_USER_ALIAS;

  modelRunButtonSpinnerName = 'modelRunButtonSpinnerName';
  modelCancelButtonSpinnerName = 'modelCancelButtonSpinnerName';

  isRunButtonPressed = false;
  isCancelButtonPressed = false;

  schemaIsExpanded = true;

  // modelTreeLevelsFlatTime = common.ModelTreeLevelsEnum.FlatTime;
  modelTreeLevelsFlat = common.ModelTreeLevelsEnum.Flat;
  // modelTreeLevelsNestedFlatTime = common.ModelTreeLevelsEnum.NestedFlatTime;
  modelTreeLevelsNested = common.ModelTreeLevelsEnum.Nested;

  queryStatusEnum = common.QueryStatusEnum;
  connectionTypeEnum = common.ConnectionTypeEnum;
  chartTypeEnum = common.ChartTypeEnum;
  requestPartTypeEnum = common.RequestPartTypeEnum;

  requestPartTypeEnumReqTemplate = common.RequestPartTypeEnum.ReqTemplate;
  requestPartTypeEnumReqFunction = common.RequestPartTypeEnum.ReqFunction;
  requestPartTypeEnumReqJsonParts = common.RequestPartTypeEnum.ReqJsonParts;
  requestPartTypeEnumReqBody = common.RequestPartTypeEnum.ReqBody;
  requestPartTypeEnumReqUrlPath = common.RequestPartTypeEnum.ReqUrlPath;

  chartTypeEnumTable = common.ChartTypeEnum.Table;
  chartTypeEnumLine = common.ChartTypeEnum.Line;
  chartTypeEnumBar = common.ChartTypeEnum.Bar;
  chartTypeEnumScatter = common.ChartTypeEnum.Scatter;
  chartTypeEnumPie = common.ChartTypeEnum.Pie;

  lastUrl: string;

  modelTreeLevels = common.ModelTreeLevelsEnum.FlatTime;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(ui => {
      this.modelTreeLevels = ui.modelTreeLevels;
      this.cd.detectChanges();
    })
  );

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  word: string;

  filteredDraftsLength = 0;

  charts: common.ChartX[];
  chartsFilteredByWord: common.ChartX[];
  filteredCharts: common.ChartX[];

  charts$ = this.chartsQuery.select().pipe(
    tap(x => {
      this.charts = x.charts;

      this.makeFilteredCharts();
      this.cd.detectChanges();
    })
  );

  models: ModelState[];
  models$ = this.modelsQuery.select().pipe(
    tap(ml => {
      this.models = ml.models;
      this.cd.detectChanges();
    })
  );

  chart: common.ChartX;

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;

      this.modelForm.controls['model'].setValue(this.model.modelId);
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
      let ar = x.url.split('?')[0].split('/');
      this.lastUrl = ar[ar.length - 1];
      this.cd.detectChanges();
    })
  );

  // isShow = true;

  filtersIsExpanded = false;
  chartIsExpanded = true;

  mconfig: common.MconfigX;
  query: common.Query;

  mq$ = this.mqQuery.select().pipe(
    tap(x => {
      this.dryQueryEstimate = undefined;

      let oldMconfig = this.mconfig;

      this.mconfig = x.mconfig;
      this.query = x.query;

      // console.log('this.mconfig.extendedFilters');
      // console.log(this.mconfig.extendedFilters);

      // console.log(this.mconfig);

      // this.filtersIsExpanded =
      //   this.mconfig.extendedFilters.length === 0
      //     ? true
      //     : this.filtersIsExpanded;

      if (this.mconfig.timezone) {
        this.timezoneForm.controls['timezone'].setValue(this.mconfig.timezone);
        this.uiQuery.updatePart({ timezone: this.mconfig.timezone });
        this.uiService.setUserUi({ timezone: this.mconfig.timezone });
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
        this.mconfig.mconfigId !== common.EMPTY_MCONFIG_ID
      ) {
        this.qData =
          this.mconfig.queryId === this.query.queryId
            ? this.dataService.makeQData({
                query: this.query,
                mconfigFields: this.mconfig.fields
              })
            : [];

        let checkSelectResult = getSelectValid({
          chart: this.mconfig.chart,
          mconfigFields: this.mconfig.fields,
          isStoreModel: this.mconfig.isStoreModel
        });

        this.isSelectValid = checkSelectResult.isSelectValid;
        this.errorMessage = checkSelectResult.errorMessage;
      }

      if (
        common.isDefined(this.query.queryId) &&
        this.query.queryId !== common.EMPTY_QUERY_ID &&
        this.query.status === common.QueryStatusEnum.New &&
        this.isAutoRun === true
      ) {
        setTimeout(() => {
          this.run();
        }, 0);
      }

      this.cd.detectChanges();

      // workaround to remove scrolls on filters list change
      let shouldRefresh = false;

      if (
        common.isDefined(oldMconfig) &&
        oldMconfig.mconfigId !== common.EMPTY_MCONFIG_ID
      ) {
        if (
          oldMconfig.extendedFilters.length !==
          this.mconfig.extendedFilters.length
        ) {
          shouldRefresh = true;
        } else {
          oldMconfig.extendedFilters.forEach(oldExtendedFilter => {
            let newExtendedFilter = this.mconfig.extendedFilters.find(
              y => y.fieldId === oldExtendedFilter.fieldId
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

  isAutoRun = false;
  isFormat = true;

  resultsIsShow = true;
  resultsIsShowTemp = false;
  rightIsShow = true;

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

  modelForm = this.fb.group({
    model: [undefined]
  });

  timezoneForm = this.fb.group({
    timezone: [undefined]
  });

  timezones = common.getTimezones();

  timeDiff: number;

  dryId: string;
  dryQueryEstimate: common.QueryEstimate;
  dryDataSize: string;

  qData: QDataRow[];

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

  requestPartTypeForm: FormGroup = this.fb.group({
    requestPartType: [common.RequestPartTypeEnum.ReqJsonParts]
  });

  requestPartTypeList: RequestPartTypeItem[] = [
    {
      label: 'Request Template',
      value: common.RequestPartTypeEnum.ReqTemplate
    },
    {
      label: 'Request Function',
      value: common.RequestPartTypeEnum.ReqFunction
    },
    {
      label: 'Request JSON Parts',
      value: common.RequestPartTypeEnum.ReqJsonParts
    },
    {
      label: 'Request Body',
      value: common.RequestPartTypeEnum.ReqBody
    },
    {
      label: 'Request Url Path',
      value: common.RequestPartTypeEnum.ReqUrlPath
    }
  ];

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
    //
    {
      label: 'Line',
      value: common.ChartTypeEnum.Line,
      iconPath: 'assets/charts/line.svg'
    },
    {
      label: 'Bar',
      value: common.ChartTypeEnum.Bar,
      iconPath: 'assets/charts/bar_vertical.svg'
    },
    {
      label: 'Scatter',
      value: common.ChartTypeEnum.Scatter,
      iconPath: 'assets/charts/scatter.svg'
    },
    {
      label: 'Pie',
      value: common.ChartTypeEnum.Pie,
      iconPath: 'assets/charts/pie.svg'
    }
    //   iconPath: 'assets/charts/bubble.svg'
    //   iconPath: 'assets/charts/heat_map.svg'
    //   iconPath: 'assets/charts/tree_map.svg'
    //   iconPath: 'assets/charts/gauge.svg'
    //   iconPath: 'assets/charts/bar_vertical.svg'
    //   iconPath: 'assets/charts/bar_vertical_grouped.svg'
    //   iconPath: 'assets/charts/bar_vertical_stacked.svg'
    //   iconPath: 'assets/charts/bar_vertical_normalized.svg'
    //   iconPath: 'assets/charts/bar_horizontal.svg'
    //   iconPath: 'assets/charts/bar_horizontal_grouped.svg'
    //   iconPath: 'assets/charts/bar_horizontal_stacked.svg'
    //   iconPath: 'assets/charts/bar_horizontal_normalized.svg'
    //   iconPath: 'assets/charts/pie.svg'
    //   iconPath: 'assets/charts/pie_advanced.svg'
    //   iconPath: 'assets/charts/pie_grid.svg'
    //   iconPath: 'assets/charts/area.svg'
    //   iconPath: 'assets/charts/area_stacked.svg'
    //   iconPath: 'assets/charts/area_normalized.svg'
    //   iconPath: 'assets/charts/heat_map.svg'
    //   iconPath: 'assets/charts/tree_map.svg'
    //   iconPath: 'assets/charts/number_card.svg'
    //   iconPath: 'assets/charts/gauge.svg'
    //   iconPath: 'assets/charts/gauge_linear.svg'
  ];

  jsContent: string;

  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private chartsQuery: ChartsQuery,
    private filteredChartsQuery: FilteredChartsQuery,
    private modelsQuery: ModelsQuery,
    private modelQuery: ModelQuery,
    private userQuery: UserQuery,
    private mqQuery: MqQuery,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private apiService: ApiService,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private structService: StructService,
    private spinner: NgxSpinnerService,
    private timeService: TimeService,
    private mconfigService: MconfigService,
    private dataSizeService: DataSizeService,
    private dataService: DataService,
    private myDialogService: MyDialogService,
    private memberQuery: MemberQuery,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let ar = this.router.url.split('?')[0].split('/');
    this.lastUrl = ar[ar.length - 1];

    let uiState = this.uiQuery.getValue();
    let timezoneParam = this.route.snapshot.queryParamMap.get('timezone');
    let structState = this.structQuery.getValue();

    let timezone =
      structState.allowTimezones === false
        ? structState.defaultTimezone
        : common.isDefined(timezoneParam)
        ? timezoneParam.split('-').join('/')
        : uiState.timezone;

    if (uiState.timezone !== timezone) {
      this.uiQuery.updatePart({ timezone: timezone });
      this.uiService.setUserUi({ timezone: timezone });
    }

    this.timezoneForm.controls['timezone'].setValue(timezone);

    this.searchWordChange();

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

  toggleResults() {
    if (this.resultsIsShow === false || this.rightIsShow === true) {
      this.resultsIsShow = true;
      this.rightIsShow = false;
    }
  }

  toggleSplit() {
    if (this.resultsIsShow === false || this.rightIsShow === false) {
      this.resultsIsShow = true;
      this.resultsIsShowTemp = true;
      this.rightIsShow = false;
      setTimeout(() => {
        this.rightIsShow = true;
        this.resultsIsShowTemp = false;
      });
    }
  }

  toggleRight() {
    if (this.resultsIsShow === true || this.rightIsShow === false) {
      this.resultsIsShow = false;
      this.rightIsShow = true;
    }
  }

  refreshShow() {
    // this.isShow = false;
    // setTimeout(() => {
    //   this.isShow = true;
    // });
  }

  expandFiltersPanel() {
    if (this.filtersIsExpanded === false) {
      this.filtersIsExpanded = true;
      if (this.mconfig.extendedFilters.length !== 0) {
        this.refreshShow();
      }
    }
  }

  toggleFiltersPanel() {
    if (this.mconfig.extendedFilters.length > 0) {
      this.filtersIsExpanded = !this.filtersIsExpanded;
      this.refreshShow();
    }
  }

  toggleChartPanel() {
    this.chartIsExpanded = !this.chartIsExpanded;
    this.refreshShow();
  }

  toggleDataPanel() {}

  toggleInfoPanel() {}

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

    this.mconfigService.navCreateTempMconfigAndQuery({
      newMconfig: newMconfig
    });
  }

  modelChange() {
    (document.activeElement as HTMLElement).blur();

    let modelId = this.modelForm.controls['model'].value;
    this.navigateService.navigateToModel(modelId);
  }

  timezoneChange() {
    (document.activeElement as HTMLElement).blur();

    let timezone = this.timezoneForm.controls['timezone'].value;

    this.uiQuery.updatePart({ timezone: timezone });
    this.uiService.setUserUi({ timezone: timezone });

    if (common.isDefined(this.model?.modelId)) {
      let newMconfig = this.structService.makeMconfig();

      newMconfig.timezone = timezone;

      this.mconfigService.navCreateTempMconfigAndQuery({
        newMconfig: newMconfig
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

  requestPartTypeChange(requestPartTypeItem: RequestPartTypeItem) {
    (document.activeElement as HTMLElement).blur();

    let value = requestPartTypeItem.value;

    if (
      [
        common.RequestPartTypeEnum.ReqTemplate,
        common.RequestPartTypeEnum.ReqFunction,
        common.RequestPartTypeEnum.ReqUrlPath
      ].indexOf(value) > -1
    ) {
      this.jsContent =
        value === common.RequestPartTypeEnum.ReqTemplate
          ? `// function to make request urlPath and body (before interpolation)
${this.mconfig.storePart?.reqTemplate}`
          : value === common.RequestPartTypeEnum.ReqFunction
          ? `// function to make request urlPath and body (after interpolation)
${this.mconfig.storePart?.reqFunction}`
          : value === common.RequestPartTypeEnum.ReqJsonParts
          ? `// request urlPath and body
${this.mconfig.storePart?.reqJsonParts}`
          : value === common.RequestPartTypeEnum.ReqBody
          ? `// request body
${this.mconfig.storePart?.reqBody}`
          : value === common.RequestPartTypeEnum.ReqUrlPath
          ? `// request url path
${this.mconfig.storePart?.reqUrlPath}`
          : undefined;
    }
  }

  chartTypeChange(newChartTypeValue?: common.ChartTypeEnum) {
    (document.activeElement as HTMLElement).blur();

    if (common.isDefined(newChartTypeValue)) {
      this.chartTypeForm.controls['chartType'].setValue(newChartTypeValue);
    }

    let oldChartType = this.mconfig.chart.type;
    let newChartType = this.chartTypeForm.controls['chartType'].value;

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.type = newChartType;

    let fields: common.ModelField[];
    this.modelQuery.fields$
      .pipe(
        tap(x => (fields = x)),
        take(1)
      )
      .subscribe();

    newMconfig = common.setChartFields({
      oldChartType: oldChartType,
      newChartType: newChartType,
      mconfig: newMconfig,
      fields: fields
    });

    newMconfig.chart.series.forEach(s => (s.type = newChartType));

    this.mconfigService.navCreateTempMconfig({
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
      chartId: undefined
    });
  }

  chartTitleBlur() {
    let chartTitle = this.chartTitleForm.controls['chartTitle'].value;

    let newMconfig = this.structService.makeMconfig();

    if (!this.chartTitleForm.valid || chartTitle === newMconfig.chart.title) {
      return;
    }

    newMconfig.chart.title = chartTitle;

    this.mconfigService.navCreateTempMconfig({
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

  timezoneSearchFn(term: string, timezone: { value: string; label: string }) {
    let haystack = [`${timezone.label}`];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  toggleSchemaPanel() {
    this.schemaIsExpanded = !this.schemaIsExpanded;
  }

  setModelTreeLevels(modelTreeLevels: common.ModelTreeLevelsEnum) {
    this.uiQuery.updatePart({
      modelTreeLevels: modelTreeLevels
    });

    this.uiService.setUserUi({
      modelTreeLevels: modelTreeLevels
    });
  }

  toggleChartsList() {
    if (this.lastUrl !== this.pathChartsList) {
      this.title.setTitle(this.pageTitle);

      this.navigateService.navigateToChartsList();
    }
  }

  toggleModelsList() {
    if (this.lastUrl !== this.pathModelsList) {
      this.title.setTitle(this.pageTitle);

      this.mqQuery.reset();
      // this.modelQuery.reset();
      this.navigateService.navigateToModelsList();
    }
  }

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredCharts();
      this.cd.detectChanges();
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredCharts();
    this.cd.detectChanges();
  }

  navToChart(chart: common.ChartX) {
    // this.navigateService.navigateToReport({
    //   reportId: report.reportId
    // });
  }

  deleteDrafts() {}

  deleteDraftChart(event: any, chart: common.ChartX) {
    event.stopPropagation();
    // this.reportService.deleteDraftReports({ reportIds: [chart.reportId] });
  }

  makeFilteredCharts() {
    let idxs;

    // TODO:

    let draftCharts: common.ChartX[] =
      // this.charts.filter(x => x.draft === true)
      [];

    // TODO:
    let nonDraftCharts =
      // .filter(x => x.draft === false)
      this.charts;

    if (common.isDefinedAndNotEmpty(this.word)) {
      let haystack = nonDraftCharts.map(x =>
        common.isDefined(x.title) ? `${x.title}` : `${x.chartId}`
      );
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.word);
    }

    this.chartsFilteredByWord = common.isDefinedAndNotEmpty(this.word)
      ? idxs != null && idxs.length > 0
        ? idxs.map(idx => nonDraftCharts[idx])
        : []
      : nonDraftCharts;

    this.filteredCharts = [...draftCharts, ...this.chartsFilteredByWord];

    this.filteredCharts = this.filteredCharts.sort((a, b) => {
      let aTitle = a.title || a.chartId;
      let bTitle = b.title || b.chartId;

      // TODO:
      // return b.draft === true && a.draft !== true
      // ? 1
      // : a.draft === true && b.draft !== true
      // ? -1
      // :
      // aTitle > bTitle
      // ? 1
      // : bTitle > aTitle
      // ? -1
      // : 0;

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    this.filteredChartsQuery.update({
      filteredCharts: this.filteredCharts
    });

    // TODO:
    // this.filteredDraftsLength = this.filteredCharts.filter(
    //   y => y.draft === true
    // ).length;
  }

  addChart() {}

  addModel() {}

  ngOnDestroy() {
    // console.log('ngOnDestroyModel')
    this.mqQuery.reset();
    this.modelQuery.reset();

    this.runButtonTimerSubscription?.unsubscribe();
    this.cancelButtonTimerSubscription?.unsubscribe();

    if (common.isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }
}

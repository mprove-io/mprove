import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
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
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { DataSizeService } from '~front/app/services/data-size.service';
import { QDataRow } from '~front/app/services/data.service';
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
import { ChartQuery } from '~front/app/queries/chart.query';
import { ChartsQuery } from '~front/app/queries/charts.query';
import { FilteredChartsQuery } from '~front/app/queries/filtered-charts.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { StructChartResolver } from '~front/app/resolvers/struct-chart.resolver';
import { ChartService } from '~front/app/services/chart.service';
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

  @ViewChild('leftChartsContainer') leftChartsContainer!: ElementRef;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.requestPartTypeSelectElement?.close();
    this.chartTypeSelectElement?.close();
  }

  isInitialScrollCompleted = false;

  pageTitle = frontConstants.CHARTS_PAGE_TITLE;

  emptyChartId = common.EMPTY_CHART_ID;

  pathCharts = common.PATH_CHARTS;
  pathChartsList = common.PATH_CHARTS_LIST;
  pathModelsList = common.PATH_MODELS_LIST;

  restrictedUserAlias = common.RESTRICTED_USER_ALIAS;

  modelRunButtonSpinnerName = 'modelRunButtonSpinnerName';
  modelCancelButtonSpinnerName = 'modelCancelButtonSpinnerName';

  isFilterByModel = false;

  isRunButtonPressed = false;
  isCancelButtonPressed = false;

  modelIsExpanded = false;

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
  modelTreeLevels$ = this.uiQuery.modelTreeLevels$.pipe(
    tap(x => {
      this.modelTreeLevels = x;
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
      // this.scrollToSelectedChart();
    })
  );

  models: ModelState[];
  models$ = this.modelsQuery.select().pipe(
    tap(ml => {
      this.models = ml.models;
      this.cd.detectChanges();
    })
  );

  isAddParameter = false;
  filterByFieldsList: common.ModelFieldY[] = [];
  isDisabledApplyAlreadyFiltered = false;
  newParameterFieldId: string;

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;

      this.filterByFieldsList = this.model.fields
        .map(y =>
          Object.assign({}, y, {
            partLabel: common.isDefined(y.groupLabel)
              ? `${y.topLabel} ${y.groupLabel} ${y.label}`
              : `${y.topLabel} ${y.label}`
          } as common.ModelFieldY)
        )
        .sort((a, b) =>
          a.partLabel > b.partLabel ? 1 : b.partLabel > a.partLabel ? -1 : 0
        );

      this.modelForm.controls['model'].setValue(this.model.modelId);

      if (this.isFilterByModel === true) {
        this.makeFilteredCharts();
      }

      this.cd.detectChanges();
      // this.scrollToSelectedChart();

      this.setProjectModelLink({ modelId: this.model.modelId });
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
  qData: QDataRow[];

  chart: common.ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;

      if (common.isDefined(this.chart?.chartId)) {
        this.title.setTitle(
          `${this.pageTitle} - ${this.chart?.title || this.chart?.chartId}`
        );
      }

      this.dryQueryEstimate = undefined;

      this.mconfig = x.tiles[0].mconfig;
      this.query = x.tiles[0].query;

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

      this.cd.detectChanges();

      if (x.draft === false && this.chart.chartId !== common.EMPTY_CHART_ID) {
        this.setProjectChartLink({ chartId: this.chart.chartId });
      }

      // workaround to remove scrolls on filters list change
      // let shouldRefresh = false;

      // if (
      //   common.isDefined(oldMconfig) &&
      //   oldMconfig.mconfigId !== common.EMPTY_MCONFIG_ID
      // ) {
      //   if (
      //     oldMconfig.extendedFilters.length !==
      //     this.mconfig.extendedFilters.length
      //   ) {
      //     shouldRefresh = true;
      //   } else {
      //     oldMconfig.extendedFilters.forEach(oldExtendedFilter => {
      //       let newExtendedFilter = this.mconfig.extendedFilters.find(
      //         y => y.fieldId === oldExtendedFilter.fieldId
      //       );

      //       if (common.isUndefined(newExtendedFilter)) {
      //         shouldRefresh = true;
      //       } else if (
      //         oldExtendedFilter.fractions.length !==
      //         newExtendedFilter.fractions.length
      //       ) {
      //         shouldRefresh = true;
      //       }
      //     });
      //   }
      // }
      // if (shouldRefresh === true) {
      //   setTimeout(() => {
      //     this.refreshShow();
      //   });
      // }
      //
    })
  );

  isAutoRun = false;
  isFormat = true;

  resultsIsShow = true;
  resultsIsShowTemp = false;

  rightIsShow = false;

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

  timezoneForm = this.fb.group({
    timezone: [undefined]
  });

  timezones = common.getTimezones();

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

  timeDiff: number;

  dryId: string;
  dryQueryEstimate: common.QueryEstimate;
  dryDataSize: string;

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
    private chartQuery: ChartQuery,
    private structChartResolver: StructChartResolver,
    private location: Location,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private apiService: ApiService,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private structService: StructService,
    private spinner: NgxSpinnerService,
    private timeService: TimeService,
    private chartService: ChartService,
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

    this.timezoneForm.controls['timezone'].setValue(uiState.timezone);

    // this.searchWordChange();

    setTimeout(() => {
      this.scrollToSelectedChart({ isSmooth: false });
    });

    this.checkRunning$ = interval(3000)
      .pipe(
        concatMap(() => {
          if (this.query?.status === common.QueryStatusEnum.Running) {
            let nav = this.navQuery.getValue();

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
                    let newTile = Object.assign({}, this.chart.tiles[0], {
                      query: resp.payload.query
                    });

                    let newChart = Object.assign({}, this.chart, {
                      tiles: [newTile]
                    });

                    this.chartQuery.update(newChart);
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

    this.chartService.editChart({
      mconfig: newMconfig,
      isDraft: this.chart.draft,
      chartId: this.chart.chartId
    });

    // this.mconfigService.navCreateTempMconfigAndQuery({
    //   newMconfig: newMconfig
    // });
  }

  modelChange() {
    (document.activeElement as HTMLElement).blur();

    let modelId = this.modelForm.controls['model'].value;

    // chart (empty model not available for selection)
    this.setProjectChartLink({ chartId: common.EMPTY_CHART_ID });

    if (this.lastUrl === this.pathChartsList) {
      this.navigateService.navigateToChartsList({
        modelId: modelId
      });
    } else if (this.lastUrl === this.pathModelsList) {
      this.navigateService.navigateToModelsList({
        modelId: modelId
      });
    } else if (common.isDefined(modelId)) {
      this.navigateService.navigateToChart({
        modelId: modelId,
        chartId: common.EMPTY_CHART_ID
      });
    } else {
      this.navigateService.navigateToCharts();
    }
  }

  timezoneChange() {
    (document.activeElement as HTMLElement).blur();

    let timezone = this.timezoneForm.controls['timezone'].value;

    this.uiQuery.updatePart({ timezone: timezone });
    this.uiService.setUserUi({ timezone: timezone });

    let uiState = this.uiQuery.getValue();

    if (common.isDefined(this.chart.chartId)) {
      this.structChartResolver
        .resolveRoute({
          chartId: this.chart.chartId,
          route: this.route.snapshot,
          showSpinner: true,
          timezone: uiState.timezone
        })
        .pipe(
          tap(x => {
            let uiStateB = this.uiQuery.getValue();

            let url = this.router
              .createUrlTree([], {
                relativeTo: this.route,
                queryParams: {
                  timezone: uiStateB.timezone.split('/').join('-')
                }
              })
              .toString();

            this.location.go(url);
          }),
          take(1)
        )
        .subscribe();
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

              // this.chartQuery.updatePart({ query: query });

              let newTile = Object.assign({}, this.chart.tiles[0], {
                query: query
              });

              let newChart = Object.assign({}, this.chart, {
                tiles: [newTile]
              });

              this.chartQuery.update(newChart);
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
                // this.chartQuery.updatePart({ query: errorQueries[0] });

                let newTile = Object.assign({}, this.chart.tiles[0], {
                  query: errorQueries[0]
                });

                let newChart = Object.assign({}, this.chart, {
                  tiles: [newTile]
                });

                this.chartQuery.update(newChart);
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
              // this.chartQuery.updatePart({ query: queries[0] });

              let newTile = Object.assign({}, this.chart.tiles[0], {
                query: queries[0]
              });

              let newChart = Object.assign({}, this.chart, {
                tiles: [newTile]
              });

              this.chartQuery.update(newChart);
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

    if (this.mconfig.chart.type === newChartTypeValue) {
      return;
    }

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

    // this.mconfigService.navCreateTempMconfig({
    //   newMconfig: newMconfig
    // });

    // query not changed
    this.chartService.editChart({
      mconfig: newMconfig,
      isDraft: this.chart.draft,
      chartId: this.chart.chartId
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
      chartId: undefined,
      isToDuplicateQuery: false
    });
  }

  chartTitleBlur() {
    let chartTitle = this.chartTitleForm.controls['chartTitle'].value;

    let newMconfig = this.structService.makeMconfig();

    if (!this.chartTitleForm.valid || chartTitle === newMconfig.chart.title) {
      return;
    }

    newMconfig.chart.title = chartTitle;

    // this.mconfigService.navCreateTempMconfig({
    //   newMconfig: newMconfig
    // });

    // query not changed
    this.chartService.editChart({
      mconfig: newMconfig,
      isDraft: this.chart.draft,
      chartId: this.chart.chartId
    });
  }

  isQueryIdTheSameAndServerTsChanged(respQuery: common.Query) {
    // let query: common.Query;

    // this.chartQuery
    //   .select()
    //   .pipe(
    //     tap(x => {
    //       query = x.tiles[0].query;
    //     }),
    //     take(1)
    //   )
    //   .subscribe();

    return (
      respQuery.queryId === this.chart.tiles[0].query.queryId &&
      respQuery.serverTs !== this.chart.tiles[0].query.serverTs
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

  addParameter() {
    this.isAddParameter = true;
  }

  filterBySearchFn(term: string, modelFieldY: common.ModelFieldY) {
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

  filterByChange() {
    (document.activeElement as HTMLElement).blur();

    this.isDisabledApplyAlreadyFiltered =
      this.mconfig.extendedFilters
        .map(ef => ef.fieldId)
        .indexOf(this.newParameterFieldId) > -1;
  }

  applyAddParameter() {
    if (common.isUndefined(this.newParameterFieldId)) {
      return;
    }
  }

  cancelAddParameter() {
    this.isAddParameter = false;
    this.newParameterFieldId = undefined;
  }

  toggleModelFieldsPanel() {
    this.modelIsExpanded = !this.modelIsExpanded;

    this.cd.detectChanges();
    this.scrollToSelectedChart({ isSmooth: true });
  }

  toggleInfoPanel() {
    this.rightIsShow = !this.rightIsShow;
  }

  setModelTreeLevels(modelTreeLevels: common.ModelTreeLevelsEnum) {
    this.uiQuery.updatePart({
      modelTreeLevels: modelTreeLevels
    });

    this.uiService.setUserUi({
      modelTreeLevels: modelTreeLevels
    });
  }

  navToChartsList() {
    if (this.lastUrl !== this.pathChartsList) {
      this.chartQuery.reset();

      this.navigateService.navigateToChartsList({
        modelId: this.model?.modelId
      });
    }
  }

  navToModelsList() {
    if (this.lastUrl !== this.pathModelsList) {
      this.chartQuery.reset();

      this.navigateService.navigateToModelsList({
        modelId: this.model?.modelId
      });
    }
  }

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredCharts();

      this.cd.detectChanges();
      // this.scrollToSelectedChart();
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredCharts();

    this.cd.detectChanges();
    // this.scrollToSelectedChart();
  }

  navToChart(chart: common.ChartX) {
    this.navigateService.navigateToChart({
      modelId: chart.modelId,
      chartId: chart.chartId
    });
  }

  deleteDrafts() {
    this.chartService.deleteDraftCharts({
      chartIds: this.filteredCharts
        .filter(x => x.draft === true)
        .map(x => x.chartId)
    });
  }

  deleteDraftChart(event: any, chart: common.ChartX) {
    event.stopPropagation();

    this.chartService.deleteDraftCharts({
      chartIds: [chart.chartId]
    });
  }

  chartSaveAs(event: any) {
    event.stopPropagation();

    this.myDialogService.showChartSaveAs({
      apiService: this.apiService,
      chart: this.chart,
      model: this.model
    });
  }

  makeFilteredCharts() {
    let idxs;

    let draftCharts: common.ChartX[] =
      this.isFilterByModel === false
        ? this.charts.filter(x => x.draft === true)
        : common.isDefined(this.model?.modelId)
        ? this.charts.filter(
            x => x.draft === true && x.modelId === this.model.modelId
          )
        : [];

    let nonDraftCharts =
      this.isFilterByModel === false
        ? this.charts.filter(x => x.draft === false)
        : common.isDefined(this.model?.modelId)
        ? this.charts.filter(
            x => x.draft === false && x.modelId === this.model.modelId
          )
        : [];

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

      return b.draft === true && a.draft !== true
        ? 1
        : a.draft === true && b.draft !== true
        ? -1
        : aTitle > bTitle
        ? 1
        : bTitle > aTitle
        ? -1
        : 0;
    });

    this.filteredCharts.forEach(chart => {
      chart.iconPath = this.chartTypesList.find(
        x => x.value === chart.chartType
      ).iconPath;
    });

    this.filteredChartsQuery.update({
      filteredCharts: this.filteredCharts
    });

    this.filteredDraftsLength = this.filteredCharts.filter(
      y => y.draft === true
    ).length;
  }

  newChart() {
    if (common.isDefined(this.model.modelId)) {
      if (this.modelIsExpanded === false) {
        this.modelIsExpanded = true;
      }

      this.setProjectChartLink({ chartId: common.EMPTY_CHART_ID });

      this.navigateService.navigateToChart({
        modelId: this.model.modelId,
        chartId: common.EMPTY_CHART_ID
      });
    }
  }

  addModel() {}

  toggleFilterByModel() {
    this.isFilterByModel = !this.isFilterByModel;
    this.makeFilteredCharts();

    this.cd.detectChanges();
    // this.scrollToSelectedChart();
  }

  setProjectModelLink(item: { modelId: string }) {
    let { modelId } = item;

    if (common.isUndefined(modelId)) {
      return;
    }

    let nav = this.navQuery.getValue();

    let links = this.uiQuery.getValue().projectModelLinks;

    let link: common.ProjectModelLink = links.find(
      l => l.projectId === nav.projectId
    );

    let newProjectModelLinks;

    if (common.isDefined(link)) {
      let newLink = {
        projectId: nav.projectId,
        modelId: modelId,
        lastNavTs: Date.now()
      };

      newProjectModelLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === nav.projectId))
      ];
    } else {
      let newLink = {
        projectId: nav.projectId,
        modelId: modelId,
        lastNavTs: Date.now()
      };

      newProjectModelLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectModelLinks = newProjectModelLinks.filter(
      l => l.lastNavTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({ projectModelLinks: newProjectModelLinks });
    this.uiService.setUserUi({ projectModelLinks: newProjectModelLinks });
  }

  setProjectChartLink(item: { chartId: string }) {
    let { chartId } = item;

    if (common.isUndefined(chartId)) {
      return;
    }

    let nav = this.navQuery.getValue();
    let links = this.uiQuery.getValue().projectChartLinks;

    let link: common.ProjectChartLink = links.find(
      l => l.projectId === nav.projectId
    );

    let newProjectChartLinks;

    if (common.isDefined(link)) {
      let newLink: common.ProjectChartLink = {
        projectId: nav.projectId,
        chartId: chartId,
        lastNavTs: Date.now()
      };

      newProjectChartLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === nav.projectId))
      ];
    } else {
      let newLink: common.ProjectChartLink = {
        projectId: nav.projectId,
        chartId: chartId,
        lastNavTs: Date.now()
      };

      newProjectChartLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectChartLinks = newProjectChartLinks.filter(
      l => l.lastNavTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({ projectChartLinks: newProjectChartLinks });
    this.uiService.setUserUi({ projectChartLinks: newProjectChartLinks });
  }

  scrollToSelectedChart(item: { isSmooth: boolean }) {
    let { isSmooth } = item;

    if (this.chart) {
      let selectedElement =
        this.leftChartsContainer.nativeElement.querySelector(
          `[chartId="${this.chart.chartId}"]`
        );

      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: isSmooth === true ? 'smooth' : 'auto',
          block: 'center'
        });
      }
    }

    if (this.isInitialScrollCompleted === false) {
      this.isInitialScrollCompleted = true;
      this.cd.detectChanges();
    }
  }

  ngOnDestroy() {
    // console.log('charts ngOnDestroy');
    this.chartQuery.reset();
    this.modelQuery.reset();

    this.runButtonTimerSubscription?.unsubscribe();
    this.cancelButtonTimerSubscription?.unsubscribe();

    if (common.isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }
}

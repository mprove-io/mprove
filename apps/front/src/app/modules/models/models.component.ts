import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@ali-hm/angular-tree-component';
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
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent } from '@ng-select/ng-select';
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
import { CHARTS_PAGE_TITLE } from '#common/constants/page-titles';
import {
  EMPTY_CHART_ID,
  EMPTY_MCONFIG_ID,
  EMPTY_QUERY_ID,
  PATH_CHARTS_LIST,
  PATH_MODELS,
  PATH_MODELS_LIST,
  RESTRICTED_USER_ALIAS
} from '#common/constants/top';
import { REFRESH_LIST } from '#common/constants/top-front';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { ModelTreeLevelsEnum } from '#common/enums/model-tree-levels-enum.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { PanelEnum } from '#common/enums/panel.enum';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { QueryPartEnum } from '#common/enums/query-part.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { getTimezones } from '#common/functions/get-timezones';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { makeId } from '#common/functions/make-id';
import { setChartFields } from '#common/functions/set-chart-fields';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { ModelX } from '#common/interfaces/backend/model-x';
import { QueryEstimate } from '#common/interfaces/backend/query-estimate';
import { ModelField } from '#common/interfaces/blockml/model-field';
import { ModelFieldY } from '#common/interfaces/blockml/model-field-y';
import { Query } from '#common/interfaces/blockml/query';
import { RefreshItem } from '#common/interfaces/front/refresh-item';
import {
  ToBackendCancelQueriesRequestPayload,
  ToBackendCancelQueriesResponse
} from '#common/interfaces/to-backend/queries/to-backend-cancel-queries';
import {
  ToBackendGetQueryRequestPayload,
  ToBackendGetQueryResponse
} from '#common/interfaces/to-backend/queries/to-backend-get-query';
import {
  ToBackendRunQueriesRequestPayload,
  ToBackendRunQueriesResponse
} from '#common/interfaces/to-backend/queries/to-backend-run-queries';
import {
  ToBackendRunQueriesDryRequestPayload,
  ToBackendRunQueriesDryResponse
} from '#common/interfaces/to-backend/queries/to-backend-run-queries-dry';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { ChartQuery } from '~front/app/queries/chart.query';
import { ChartsQuery } from '~front/app/queries/charts.query';
import { FilteredChartsQuery } from '~front/app/queries/filtered-charts.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelQuery, ModelState } from '~front/app/queries/model.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { StructChartResolver } from '~front/app/resolvers/struct-chart.resolver';
import { ApiService } from '~front/app/services/api.service';
import { ChartService } from '~front/app/services/chart.service';
import { DataService, QDataRow } from '~front/app/services/data.service';
import { DataSizeService } from '~front/app/services/data-size.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { StructService } from '~front/app/services/struct.service';
import { TimeService } from '~front/app/services/time.service';
import { UiService } from '~front/app/services/ui.service';
import { ValidationService } from '~front/app/services/validation.service';

export class ChartsItemNode {
  id: string;
  isTop: boolean;
  isEmpty: boolean;
  topLabel: string;
  connectionType: ConnectionTypeEnum;
  chart: ChartX;
  children: ChartsItemNode[];
}

export class QueryPartItem {
  label: string;
  value: QueryPartEnum;
}

export class ChartTypeItem {
  label: string;
  value: ChartTypeEnum;
  iconPath: string;
}

@Component({
  standalone: false,
  selector: 'm-models',
  templateUrl: './models.component.html'
})
export class ModelsComponent implements OnInit, OnDestroy {
  @ViewChild('chartTypeSelect', { static: false })
  chartTypeSelectElement: NgSelectComponent;

  @ViewChild('queryPartSelect', { static: false })
  queryPartSelectElement: NgSelectComponent;

  @ViewChild('modelsModelSelect', { static: false })
  modelsModelSelectElement: NgSelectComponent;

  @ViewChild('leftChartsContainer') leftChartsContainer!: ElementRef;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.queryPartSelectElement?.close();
    this.chartTypeSelectElement?.close();
  }

  isInitialScrollCompleted = false;

  pageTitle = CHARTS_PAGE_TITLE;

  emptyChartId = EMPTY_CHART_ID;

  pathModels = PATH_MODELS;
  pathChartsList = PATH_CHARTS_LIST;
  pathModelsList = PATH_MODELS_LIST;

  restrictedUserAlias = RESTRICTED_USER_ALIAS;

  modelRunButtonSpinnerName = 'modelRunButtonSpinnerName';
  modelCancelButtonSpinnerName = 'modelCancelButtonSpinnerName';

  isRunButtonPressed = false;
  isCancelButtonPressed = false;

  modelTreeLevelsFlat = ModelTreeLevelsEnum.Flat;
  modelTreeLevelsFlatTime = ModelTreeLevelsEnum.FlatTime;
  modelTreeLevelsNested = ModelTreeLevelsEnum.Nested;

  queryStatusEnum = QueryStatusEnum;
  connectionTypeEnum = ConnectionTypeEnum;
  chartTypeEnum = ChartTypeEnum;

  queryPartEnum = QueryPartEnum;

  modelTypeStore = ModelTypeEnum.Store;
  modelTypeMalloy = ModelTypeEnum.Malloy;

  chartTypeEnumTable = ChartTypeEnum.Table;
  chartTypeEnumSingle = ChartTypeEnum.Single;
  chartTypeEnumLine = ChartTypeEnum.Line;
  chartTypeEnumBar = ChartTypeEnum.Bar;
  chartTypeEnumScatter = ChartTypeEnum.Scatter;
  chartTypeEnumPie = ChartTypeEnum.Pie;

  lastUrl: string;

  modelTreeLevels = ModelTreeLevelsEnum.FlatTime;
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

  searchChartsWord: string;
  searchSchemaWord: string;

  filteredDraftsLength = 0;

  charts: ChartX[];
  chartsFilteredByWord: ChartX[];
  filteredCharts: ChartX[];

  filteredChartNodes: ChartsItemNode[] = [];

  charts$ = this.chartsQuery.select().pipe(
    tap(x => {
      this.charts = x.charts;

      this.makeFilteredCharts();

      this.cd.detectChanges();
    })
  );

  filteredModels: ModelX[];

  models: ModelX[];
  modelsSubscription: Subscription;

  sortedFieldsList: ModelFieldY[] = [];
  sortedNotHiddenFieldsList: ModelFieldY[] = [];
  isDisabledApplyAlreadyFiltered = false;

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;

      if (
        isDefined(this.model.modelId) &&
        ((this.model.type === ModelTypeEnum.Malloy &&
          [
            QueryPartEnum.MalloyQuery,
            QueryPartEnum.MalloyCompiledQuery,
            QueryPartEnum.SqlMalloy,
            QueryPartEnum.YamlTile,
            QueryPartEnum.MalloySource,
            QueryPartEnum.JsonResults
          ].indexOf(this.queryPartForm.controls['queryPart'].value) < 0) ||
          (this.model.type === ModelTypeEnum.Store &&
            [
              QueryPartEnum.JsonStoreRequestParts,
              QueryPartEnum.JavascriptStoreRequestFunction,
              QueryPartEnum.YamlTile,
              QueryPartEnum.YamlStore,
              QueryPartEnum.JsonResults
            ].indexOf(this.queryPartForm.controls['queryPart'].value) < 0))
      ) {
        let queryPart =
          this.model.type === ModelTypeEnum.Store
            ? QueryPartEnum.JsonStoreRequestParts
            : this.model.type === ModelTypeEnum.Malloy
              ? QueryPartEnum.MalloyQuery
              : undefined;

        if (
          isDefined(queryPart) &&
          this.queryPartForm.controls['queryPart'].value !== queryPart
        ) {
          this.queryPartForm.controls['queryPart'].setValue(queryPart);
        }
      }

      this.sortedFieldsList = this.model.fields
        .map(y =>
          Object.assign({}, y, {
            partLabel: isDefined(y.groupLabel)
              ? `${y.topLabel} ${y.groupLabel} ${y.label}`
              : `${y.topLabel} ${y.label}`
          } as ModelFieldY)
        )
        .sort((a, b) =>
          a.fieldClass !== FieldClassEnum.Dimension &&
          b.fieldClass === FieldClassEnum.Dimension
            ? 1
            : a.fieldClass === FieldClassEnum.Dimension &&
                b.fieldClass !== FieldClassEnum.Dimension
              ? -1
              : a.fieldClass !== FieldClassEnum.Filter &&
                  b.fieldClass === FieldClassEnum.Filter
                ? 1
                : a.fieldClass === FieldClassEnum.Filter &&
                    b.fieldClass !== FieldClassEnum.Filter
                  ? -1
                  : a.partLabel > b.partLabel
                    ? 1
                    : b.partLabel > a.partLabel
                      ? -1
                      : 0
        );

      this.sortedNotHiddenFieldsList = this.sortedFieldsList.filter(
        y => y.hidden === false
      );

      this.modelForm.controls['model'].setValue(this.model.modelId);

      this.makeFilteredCharts();

      this.cd.detectChanges();

      this.uiService.setProjectModelLink({ modelId: this.model.modelId });
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
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

  filtersIsExpanded = false;
  chartIsExpanded = true;

  mconfig: MconfigX;
  query: Query;
  qData: QDataRow[];

  refreshProgress = 0;
  refreshSubscription: Subscription;
  refreshId: string;

  showSchema = false;
  showSchema$ = this.uiQuery.showSchema$.pipe(
    tap(x => {
      this.showSchema = x;

      if (this.showSchema === true) {
        this.isInitialScrollCompleted = false;
      }

      this.cd.detectChanges();
    })
  );

  isAutoRun = true;
  isAutoRun$ = this.uiQuery.isAutoRun$.pipe(
    tap(x => {
      this.isAutoRun = x;
      this.checkRefreshSelector();
      this.cd.detectChanges();
    })
  );

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.checkRefreshSelector();
      this.cd.detectChanges();
    })
  );

  prevChartId: string;

  chart: ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;

      if (
        this.prevChartId !== this.chart.chartId &&
        this.isInitialScrollCompleted === true
      ) {
        if (this.manualNavToChart === false) {
          this.scrollToSelectedChart({ isSmooth: true });
        }
        this.prevChartId = this.chart.chartId;
      }

      this.manualNavToChart = false;

      if (isDefined(this.chart?.chartId)) {
        this.title.setTitle(
          `${this.pageTitle} - ${this.chart?.title || this.chart?.chartId}`
        );
      }

      this.dryQueryEstimate = undefined;

      this.mconfig = x.tiles[0].mconfig;
      this.query = x.tiles[0].query;

      if (
        isDefined(this.mconfig) &&
        isDefined(this.mconfig.fields) &&
        this.mconfig.mconfigId !== EMPTY_MCONFIG_ID
      ) {
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
          isStoreModel: this.mconfig.modelType === ModelTypeEnum.Store
        });

        this.isSelectValid = checkSelectResult.isSelectValid;
        this.errorMessage = checkSelectResult.errorMessage;
      }

      this.isAutoRun = this.uiQuery.getValue().isAutoRun;
      if (this.isAutoRun === true && this.chart.chartId !== this.refreshId) {
        this.refreshForm.controls.refresh.setValue(0);
        this.refreshChange();
      }
      this.checkAutoRun();

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

      if (x.draft === false && this.chart.chartId !== EMPTY_CHART_ID) {
        this.uiService.setProjectChartLink({ chartId: this.chart.chartId });
      }
    })
  );

  refreshForm = this.fb.group({
    refresh: [undefined]
  });

  refreshList: RefreshItem[] = REFRESH_LIST;

  isFormat = true;

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

  timezoneForm = this.fb.group({
    timezone: [undefined]
  });

  timezones = getTimezones();

  struct$ = this.structQuery.select().pipe(
    tap(x => {
      if (x.mproveConfig.allowTimezones === false) {
        this.timezoneForm.controls['timezone'].disable();
      } else {
        this.timezoneForm.controls['timezone'].enable();
      }
    })
  );

  modelForm = this.fb.group({
    model: [undefined]
  });

  timeDiff: number;

  dryId: string;
  dryQueryEstimate: QueryEstimate;
  dryDataSize: string;

  isSelectValid = false;
  errorMessage = '';

  manualNavToChart = false;

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

  queryPartForm: FormGroup = this.fb.group({
    queryPart: undefined
  });

  chartTypeForm: FormGroup = this.fb.group({
    chartType: [undefined]
  });

  chartTitleForm: FormGroup = this.fb.group({
    chartTitle: [undefined, [Validators.required]]
  });

  chartTypesList: ChartTypeItem[] = [
    {
      label: 'Table',
      value: ChartTypeEnum.Table,
      iconPath: 'assets/charts/table.svg'
    },
    {
      label: 'Line',
      value: ChartTypeEnum.Line,
      iconPath: 'assets/charts/line.svg'
    },
    {
      label: 'Bar',
      value: ChartTypeEnum.Bar,
      iconPath: 'assets/charts/bar_vertical.svg'
    },
    {
      label: 'Scatter',
      value: ChartTypeEnum.Scatter,
      iconPath: 'assets/charts/scatter.svg'
    },
    {
      label: 'Single',
      value: ChartTypeEnum.Single,
      iconPath: 'assets/charts/single.svg'
    },
    {
      label: 'Pie',
      value: ChartTypeEnum.Pie,
      iconPath: 'assets/charts/pie.svg'
    }
  ];

  private searchSchemaTimer: any;
  private searchChartsTimer: any;

  actionMapping: IActionMapping = {
    mouse: {}
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'label'
  };

  @ViewChild('chartsTree') chartsTree: TreeComponent;

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

    this.modelsSubscription = this.modelsQuery
      .select()
      .pipe(
        tap(ml => {
          this.models = ml.models;
          this.filteredModels = this.models.filter(model => model.hasAccess);

          let selectedModel = this.modelQuery.getValue();

          if (
            isDefined(selectedModel.modelId) &&
            this.models.map(x => x.modelId).indexOf(selectedModel.modelId) < 0
          ) {
            this.modelQuery.reset();
          }

          this.cd.detectChanges();
        })
      )
      .subscribe();

    this.checkRunning$ = interval(3000)
      .pipe(
        concatMap(() => {
          if (this.query?.status === QueryStatusEnum.Running) {
            let nav = this.navQuery.getValue();

            let payload: ToBackendGetQueryRequestPayload = {
              projectId: nav.projectId,
              isRepoProd: nav.isRepoProd,
              branchId: nav.branchId,
              envId: nav.envId,
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId
            };

            return this.apiService
              .req({
                pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                payload: payload
              })
              .pipe(
                tap((resp: ToBackendGetQueryResponse) => {
                  if (
                    resp.info?.status === ResponseInfoStatusEnum.Ok &&
                    this.isQueryIdTheSameAndStatusOrServerTsChanged(
                      resp.payload.query
                    )
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

  treeOnInitialized() {
    this.scrollToSelectedChart({ isSmooth: false });
  }

  treeOnUpdateData() {}

  setShowSchema() {
    if (this.showSchema === true) {
      return;
    }

    this.showSchema = true;
    this.isInitialScrollCompleted = false;

    this.uiQuery.updatePart({ showSchema: true });

    this.cd.detectChanges();
  }

  setShowJsonStoreRequestParts() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(
      QueryPartEnum.JsonStoreRequestParts
    );
  }

  setShowMalloyQuery() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(
      QueryPartEnum.MalloyQuery
    );
  }

  setShowMalloyCompiledQuery() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(
      QueryPartEnum.MalloyCompiledQuery
    );
  }

  setShowSqlMalloy() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(QueryPartEnum.SqlMalloy);
  }

  setShowSqlMain() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(QueryPartEnum.SqlMain);
  }

  setShowMalloySource() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(
      QueryPartEnum.MalloySource
    );
  }

  setShowYamlTile() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(QueryPartEnum.YamlTile);
  }

  setShowYamlStore() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(QueryPartEnum.YamlStore);
  }

  setShowYamlModel() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(QueryPartEnum.YamlModel);
  }

  setShowJavascriptStoreRequestFunction() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(
      QueryPartEnum.JavascriptStoreRequestFunction
    );
  }

  setShowJsonResults() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(
      QueryPartEnum.JsonResults
    );
  }

  setShowCharts() {
    this.makeFilteredCharts();

    if (this.showSchema === true) {
      this.showSchema = false;
      this.uiQuery.updatePart({ showSchema: false });
    }

    this.cd.detectChanges();
  }

  toggleAutoRun() {
    let newIsAutoRunValue = !this.isAutoRun;

    this.isAutoRun = newIsAutoRunValue;
    this.checkAutoRun();

    this.uiQuery.updatePart({ isAutoRun: newIsAutoRunValue });
  }

  checkAutoRun() {
    if (
      isDefined(this.query.queryId) &&
      this.query.queryId !== EMPTY_QUERY_ID &&
      this.query.status === QueryStatusEnum.New &&
      this.isAutoRun === true
    ) {
      setTimeout(() => {
        this.run();
      }, 0);
    }
  }

  checkRefreshSelector() {
    if (this.isAutoRun === false) {
      if (isDefined(this.refreshForm.controls.refresh.value)) {
        this.refreshForm.controls.refresh.setValue(undefined);
      }

      if (this.refreshForm.controls.refresh.enabled) {
        this.refreshForm.controls.refresh.disable();
      }

      this.refreshChange();
    } else if (this.isAutoRun === true) {
      if (isUndefined(this.refreshForm.controls.refresh.value)) {
        this.refreshForm.controls.refresh.setValue(0);
      }

      if (
        this.refreshForm.controls.refresh.disabled &&
        this.alias !== this.restrictedUserAlias
      ) {
        this.refreshForm.controls.refresh.enable();
      } else if (this.alias === this.restrictedUserAlias) {
        this.refreshForm.controls.refresh.disable();
      }
    }
  }

  refreshChange() {
    let refreshValueSeconds: number =
      this.refreshForm.controls['refresh'].value;

    this.refreshProgress = 0;

    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    this.refreshId = this.chart?.chartId;

    if (isUndefined(refreshValueSeconds) || refreshValueSeconds === 0) {
      return;
    }

    let intervalMs = refreshValueSeconds * 1000;

    let part = refreshValueSeconds >= 5 * 60 ? 1000 : 50;

    this.refreshSubscription = interval(part).subscribe(() => {
      this.refreshProgress = Math.min(
        this.refreshProgress + (part / intervalMs) * 100,
        100
      );

      if (this.refreshProgress >= 100) {
        this.refreshProgress = 0;

        if (
          this.mconfig?.select.length > 0 &&
          this.query?.status !== QueryStatusEnum.Running
        ) {
          this.run();
        }
      }
    });
  }

  toggleFormat() {
    this.isFormat = !this.isFormat;
  }

  toggleResults() {
    if (this.rightIsShow === true) {
      this.rightIsShow = false;
    }
  }

  toggleSplit() {
    if (this.rightIsShow === false) {
      this.resultsIsShowTemp = true;
      this.rightIsShow = false;
      setTimeout(() => {
        this.rightIsShow = true;
        this.resultsIsShowTemp = false;
      });
    }
  }

  toggleRight() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
  }

  expandFiltersPanel() {
    if (this.filtersIsExpanded === false) {
      this.filtersIsExpanded = true;
    }
  }

  toggleFiltersPanel() {
    if (this.mconfig.extendedFilters.length > 0) {
      this.filtersIsExpanded = !this.filtersIsExpanded;
    }
  }

  toggleChartPanel() {
    this.chartIsExpanded = !this.chartIsExpanded;
  }

  toggleDataPanel() {}

  goToEditFile() {
    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    let fileIdAr = this.model.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath })
    });
  }

  limitBlur() {
    let limit = this.limitForm.controls['limit'];

    let newMconfig = this.structService.makeMconfig();

    if (!this.limitForm.valid || Number(limit.value) === newMconfig.limit) {
      return;
    }

    if (this.model.type === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.Limit,
          timezone: newMconfig.timezone,
          limit: Number(limit.value)
        }
      });
    } else {
      newMconfig.limit = Number(limit.value);

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });
    }
  }

  async modelChange() {
    (document.activeElement as HTMLElement).blur();

    let modelId = this.modelForm.controls['model'].value;

    // chart (empty model not available for selection)
    this.uiService.setProjectChartLink({ chartId: EMPTY_CHART_ID });

    if (this.lastUrl === this.pathChartsList) {
      await this.navigateService.navigateToChartsList({
        modelId: modelId
      });
    } else if (this.lastUrl === this.pathModelsList) {
      await this.navigateService.navigateToModelsList({
        modelId: modelId
      });
    } else {
      await this.navigateService.navigateToChart({
        modelId: modelId,
        chartId: EMPTY_CHART_ID
      });
    }

    this.uiQuery.updatePart({ showSchema: true });
  }

  timezoneChange() {
    (document.activeElement as HTMLElement).blur();

    let timezone = this.timezoneForm.controls['timezone'].value;

    this.uiQuery.updatePart({ timezone: timezone });
    this.uiService.setUserUi({ timezone: timezone });

    let uiState = this.uiQuery.getValue();

    if (isDefined(this.chart.chartId)) {
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

    let nav = this.navQuery.getValue();

    let payload: ToBackendRunQueriesRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: [this.mconfig.mconfigId]
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendRunQueriesResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let { runningQueries } = resp.payload;

            if (
              this.isQueryIdTheSameAndStatusOrServerTsChanged(runningQueries[0])
            ) {
              let query = Object.assign(runningQueries[0], {
                sql: this.query.sql,
                data: this.query.data
              });

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
    let nav = this.navQuery.getValue();

    this.dryId = makeId();

    let payload: ToBackendRunQueriesDryRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: [this.mconfig.mconfigId],
      dryId: this.dryId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendRunQueriesDryResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let { validQueryEstimates, errorQueries } = resp.payload;

            if (errorQueries.length > 0) {
              if (
                this.isQueryIdTheSameAndStatusOrServerTsChanged(errorQueries[0])
              ) {
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

              this.cd.detectChanges();
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.startCancelButtonTimer();

    let nav = this.navQuery.getValue();

    let payload: ToBackendCancelQueriesRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: [this.mconfig.mconfigId]
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCancelQueries,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCancelQueriesResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let { queries } = resp.payload;
            if (
              queries.length > 0 &&
              this.isQueryIdTheSameAndStatusOrServerTsChanged(queries[0])
            ) {
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

  chartTypeChange(newChartTypeValue?: ChartTypeEnum) {
    (document.activeElement as HTMLElement).blur();

    if (this.mconfig.chart.type === newChartTypeValue) {
      return;
    }

    if (isDefined(newChartTypeValue)) {
      this.chartTypeForm.controls['chartType'].setValue(newChartTypeValue);
    }

    let oldChartType = this.mconfig.chart.type;
    let newChartType = this.chartTypeForm.controls['chartType'].value;

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.type = newChartType;

    let fields: ModelField[];
    this.modelQuery.fields$
      .pipe(
        tap(x => (fields = x)),
        take(1)
      )
      .subscribe();

    newMconfig = setChartFields({
      oldChartType: oldChartType,
      newChartType: newChartType,
      mconfig: newMconfig,
      fields: fields
    });

    newMconfig.chart.series.forEach(s => (s.type = newChartType));

    // query not changed
    if (this.model.type === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.Get,
          timezone: newMconfig.timezone
        }
      });
    } else {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });
    }
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

    // query not changed
    if (this.model.type === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.Get,
          timezone: newMconfig.timezone
        }
      });
    } else {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });
    }
  }

  isQueryIdTheSameAndStatusOrServerTsChanged(respQuery: Query) {
    return (
      respQuery.queryId === this.chart.tiles[0].query.queryId &&
      (respQuery.status !== this.chart.tiles[0].query.status ||
        respQuery.serverTs !== this.chart.tiles[0].query.serverTs) // serverTs can be prev when New->Running
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
    this.myDialogService.showChartAddFilter({
      apiService: this.apiService,
      chart: this.chart,
      model: this.model,
      mconfig: this.mconfig,
      parameterAddedFn: () => {
        this.filtersIsExpanded = true;
      }
    });
  }

  addColumn() {
    this.myDialogService.showAddColumnField({
      apiService: this.apiService,
      chart: this.chart,
      fields: this.sortedFieldsList
    });
  }

  toggleInfoPanel() {
    this.rightIsShow = !this.rightIsShow;
  }

  toggleModelTreeLevels() {
    let newValue =
      this.modelTreeLevels === ModelTreeLevelsEnum.FlatTime
        ? ModelTreeLevelsEnum.Nested
        : ModelTreeLevelsEnum.FlatTime;

    this.uiQuery.updatePart({ modelTreeLevels: newValue });
    this.uiService.setUserUi({ modelTreeLevels: newValue });

    if (this.showSchema === false) {
      this.showSchema = true;
      this.isInitialScrollCompleted = false;

      this.uiQuery.updatePart({ showSchema: true });
    }
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

  searchSchemaWordChange() {
    if (this.searchSchemaTimer) {
      clearTimeout(this.searchSchemaTimer);
    }

    this.searchSchemaTimer = setTimeout(() => {
      this.uiQuery.updatePart({
        searchSchemaWord: this.searchSchemaWord
      });
    }, 600);
  }

  searchChartsWordChange() {
    if (this.searchChartsTimer) {
      clearTimeout(this.searchChartsTimer);
    }

    this.searchChartsTimer = setTimeout(() => {
      this.makeFilteredCharts();

      this.cd.detectChanges();
    }, 600);
  }

  resetSchemaSearch() {
    this.searchSchemaWord = undefined;
    this.uiQuery.updatePart({
      searchSchemaWord: this.searchSchemaWord
    });
  }

  resetChartsSearch() {
    this.searchChartsWord = undefined;
    this.makeFilteredCharts();

    this.cd.detectChanges();
  }

  navToChart(chart: ChartX) {
    if (this.chart.chartId !== chart.chartId) {
      this.manualNavToChart = true;

      this.navigateService.navigateToChart({
        modelId: chart.modelId,
        chartId: chart.chartId
      });
    }
  }

  deleteDrafts() {
    this.chartService.deleteDraftCharts({
      chartIds: this.filteredCharts
        .filter(x => x.draft === true)
        .map(x => x.chartId)
    });
  }

  deleteDraftChart(event: any, chart: ChartX) {
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

    let draftCharts: ChartX[] = this.charts.filter(x => x.draft === true);

    let nonDraftCharts = this.charts.filter(x => x.draft === false);

    if (isDefinedAndNotEmpty(this.searchChartsWord)) {
      let haystack = nonDraftCharts.map(x =>
        isDefined(x.title) ? `${x.title}` : `${x.chartId}`
      );
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.searchChartsWord);
    }

    this.chartsFilteredByWord = isDefinedAndNotEmpty(this.searchChartsWord)
      ? idxs != null && idxs.length > 0
        ? idxs.map((idx: number): ChartX => nonDraftCharts[idx])
        : []
      : nonDraftCharts;

    this.filteredCharts = [...draftCharts, ...this.chartsFilteredByWord];

    this.filteredCharts = this.filteredCharts.sort((a, b) => {
      let aTitle = (a.title || a.chartId).toUpperCase();
      let bTitle = (b.title || b.chartId).toUpperCase();

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

    this.makeChartsItemNodes();
  }

  makeChartsItemNodes() {
    let chartsItemNodes: ChartsItemNode[] = [];

    let models = this.modelsQuery.getValue().models;

    models
      .filter(model => model.hasAccess === true)
      .forEach(model => {
        let topNode: ChartsItemNode = {
          id: model.modelId,
          isEmpty: false,
          isTop: true,
          topLabel: model.label,
          connectionType: model.connectionType,
          chart: undefined,
          children: []
        };

        chartsItemNodes.push(topNode);
      });

    let idxs;

    let nonDraftCharts = this.charts.filter(x => x.draft === false);

    if (isDefinedAndNotEmpty(this.searchChartsWord)) {
      let haystack = nonDraftCharts.map(x =>
        isDefined(x.title)
          ? `${x.modelLabel} ${x.title}`
          : `${x.modelLabel} ${x.chartId}`
      );
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.searchChartsWord);
    }

    let chartsFilteredByWord = isDefinedAndNotEmpty(this.searchChartsWord)
      ? idxs != null && idxs.length > 0
        ? idxs.map((idx: number): ChartX => nonDraftCharts[idx])
        : []
      : nonDraftCharts;

    chartsFilteredByWord
      .sort((a, b) => {
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
      })
      .forEach(chart => {
        let chartsItemNode: ChartsItemNode = {
          id: chart.chartId,
          isEmpty: false,
          isTop: false,
          topLabel: chart.modelLabel,
          connectionType: undefined,
          chart: chart,
          children: []
        };

        let topNode: ChartsItemNode = chartsItemNodes.find(
          (node: any) => node.id === chart.modelId
        );

        if (isDefined(topNode)) {
          topNode.children.push(chartsItemNode);
        } else {
          let model = models.find(x => x.modelId === chart.modelId);

          if (model.hasAccess === true) {
            topNode = {
              id: chart.modelId,
              isEmpty: false,
              isTop: true,
              topLabel: chart.modelLabel,
              connectionType: undefined,
              chart: undefined,
              children: [chartsItemNode]
            };

            chartsItemNodes.push(topNode);
          }
        }
      });

    chartsItemNodes.forEach(topNode => {
      if (topNode.children.length === 0) {
        let emptyNode: ChartsItemNode = {
          id: 'emptyChartId',
          isEmpty: true,
          isTop: false,
          topLabel: 'No charts',
          connectionType: undefined,
          chart: undefined,
          children: []
        };

        topNode.children.push(emptyNode);
      }
    });

    this.filteredChartNodes = chartsItemNodes;
  }

  chartsItemModelNodeOnClick(node: TreeNode) {
    node.toggleActivated();
    if (node.hasChildren) {
      node.toggleExpanded();
    }
  }

  clearQuery() {
    if (isDefined(this.model.modelId)) {
      if (this.showSchema === false) {
        this.showSchema = true;
        this.isInitialScrollCompleted = false;
      }

      this.uiService.setProjectChartLink({ chartId: EMPTY_CHART_ID });

      this.navigateService.navigateToChart({
        modelId: this.model.modelId,
        chartId: EMPTY_CHART_ID
      });
    }
  }

  createModel(modelSelect?: any) {
    if (isDefined(modelSelect)) {
      modelSelect.close();
    }

    this.myDialogService.showCreateModel({
      apiService: this.apiService
    });
  }

  scrollToSelectedChart(item: { isSmooth: boolean }) {
    let { isSmooth } = item;

    if (this.chart) {
      if (this.chart.draft === false && isDefined(this.chart.modelId)) {
        this.chartsTree?.treeModel?.getNodeById(this.chart.modelId)?.expand();
      }

      let selectedElement =
        this.leftChartsContainer?.nativeElement.querySelector(
          `[chartId="${this.chart.chartId}"]`
        );

      if (isDefined(selectedElement)) {
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

  canDeactivate(): boolean {
    this.modelsSubscription?.unsubscribe();
    this.modelsSubscription = undefined;

    return true;
  }

  ngOnDestroy() {
    this.chartQuery.reset();
    this.modelQuery.reset();

    this.refreshSubscription?.unsubscribe();
    this.runButtonTimerSubscription?.unsubscribe();
    this.cancelButtonTimerSubscription?.unsubscribe();

    if (isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }
}

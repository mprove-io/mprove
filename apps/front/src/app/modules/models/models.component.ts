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
  PATH_CHART,
  PATH_CHARTS_LIST,
  PATH_MODELS,
  PATH_MODELS_LIST,
  PERSONAL_SPACE_ID,
  RESTRICTED_USER_ALIAS,
  SHARED_SPACE_ID
} from '#common/constants/top';
import { REFRESH_LIST } from '#common/constants/top-front';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { FavoriteTypeEnum } from '#common/enums/favorite-type.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { ModelTreeLevelsEnum } from '#common/enums/model-tree-levels-enum.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
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
import { makeCopy } from '#common/functions/make-copy';
import { makeId } from '#common/functions/make-id';
import { setChartFields } from '#common/functions/set-chart-fields';
import { makeSpaceUnits } from '#common/functions/space/make-space-units';
import { spaceUnitToChartUnit } from '#common/functions/space/space-unit-to-chart-unit';
import type { ChartUnit } from '#common/zod/backend/chart-unit';
import type { ChartX } from '#common/zod/backend/chart-x';
import type { MconfigX } from '#common/zod/backend/mconfig-x';
import type { ModelX } from '#common/zod/backend/model-x';
import type { QueryEstimate } from '#common/zod/backend/query-estimate';
import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceNodeX } from '#common/zod/backend/space-node-x';
import type { MconfigChart } from '#common/zod/blockml/mconfig-chart';
import type { ModelField } from '#common/zod/blockml/model-field';
import type { ModelFieldY } from '#common/zod/blockml/model-field-y';
import type { Query } from '#common/zod/blockml/query';
import type { RefreshItem } from '#common/zod/front/refresh-item';
import type {
  ToBackendSetFavoriteRequestPayload,
  ToBackendSetFavoriteResponse
} from '#common/zod/to-backend/favorites/to-backend-set-favorite';
import type {
  ToBackendCancelQueriesRequestPayload,
  ToBackendCancelQueriesResponse
} from '#common/zod/to-backend/queries/to-backend-cancel-queries';
import type {
  ToBackendGetQueryRequestPayload,
  ToBackendGetQueryResponse
} from '#common/zod/to-backend/queries/to-backend-get-query';
import type {
  ToBackendRunQueriesRequestPayload,
  ToBackendRunQueriesResponse
} from '#common/zod/to-backend/queries/to-backend-run-queries';
import type {
  ToBackendRunQueriesDryRequestPayload,
  ToBackendRunQueriesDryResponse
} from '#common/zod/to-backend/queries/to-backend-run-queries-dry';
import { getSelectValid } from '#front/app/functions/get-select-valid';
import { ChartQuery } from '#front/app/queries/chart.query';
import { ChartsQuery } from '#front/app/queries/charts.query';
import { FilteredChartsQuery } from '#front/app/queries/filtered-charts.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { ModelQuery, ModelState } from '#front/app/queries/model.query';
import { ModelsQuery } from '#front/app/queries/models.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { StructChartResolver } from '#front/app/resolvers/struct-chart.resolver';
import { ApiService } from '#front/app/services/api.service';
import { ChartService } from '#front/app/services/chart.service';
import { DataService, QDataRow } from '#front/app/services/data.service';
import { DataSizeService } from '#front/app/services/data-size.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SpaceUiService } from '#front/app/services/space-ui.service';
import { StructService } from '#front/app/services/struct.service';
import { TimeService } from '#front/app/services/time.service';
import { UiService } from '#front/app/services/ui.service';
import { UnitsUiService } from '#front/app/services/units-ui.service';
import { ValidationService } from '#front/app/services/validation.service';

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
  personalSpaceId = PERSONAL_SPACE_ID;
  sharedSpaceId = SHARED_SPACE_ID;

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
  chartTypeEnumPivotTable = ChartTypeEnum.PivotTable;

  lastUrl: string;
  selectedChartId: string | undefined;

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
  favoritesOnly = false;

  charts: ChartUnit[] = [];
  filteredCharts: ChartUnit[] = [];

  filteredChartNodes: SpaceNodeX[] = [];
  pendingExpandSpace: string;

  chartsByModel = false;
  chartsByModel$ = this.uiQuery.chartsByModel$.pipe(
    tap(x => {
      this.chartsByModel = x === true;

      this.updateFiltered({
        chartSpaceNodes: this.chartsQuery.getValue().chartSpaceNodes
      });

      this.cd.detectChanges();
    })
  );

  charts$ = this.chartsQuery.select().pipe(
    tap(x => {
      let previousCharts = this.charts ?? [];

      let nonDraftChartUnits = makeSpaceUnits({
        spaceNodes: x.chartSpaceNodes
      }).map(spaceUnit => spaceUnitToChartUnit({ spaceUnit: spaceUnit }));

      this.charts = [...x.chartUnitDrafts, ...nonDraftChartUnits];

      let chartToExpand = this.charts.find(chart => {
        let previousChart = previousCharts.find(
          previous => previous.chartId === chart.chartId
        );

        let chartDisplaySpace = chart.space;

        let previousDisplaySpace = isDefined(previousChart)
          ? previousChart.space
          : undefined;

        let isInitialLoad = previousCharts.length === 0;

        let isNewSavedChart =
          isDefined(previousChart) === false && chart.draft === false;

        let isSavedFromDraft =
          isDefined(previousChart) === true &&
          previousChart.draft === true &&
          chart.draft === false;

        let isDisplaySpaceChanged = previousDisplaySpace !== chartDisplaySpace;

        let shouldExpand =
          isInitialLoad === false &&
          isDefinedAndNotEmpty(chartDisplaySpace) === true &&
          (isNewSavedChart === true ||
            isSavedFromDraft === true ||
            isDisplaySpaceChanged === true);

        return shouldExpand;
      });

      this.pendingExpandSpace = isDefined(chartToExpand)
        ? chartToExpand.space
        : undefined;

      this.updateFiltered({ chartSpaceNodes: x.chartSpaceNodes });

      if (isDefined(this.pendingExpandSpace)) {
        let space = this.pendingExpandSpace;

        this.pendingExpandSpace = undefined;

        setTimeout(() => {
          this.expandSpacePath({ space: space });
        }, 0);
      }

      this.cd.detectChanges();
    })
  );

  filteredModels: ModelX[];
  modelSelectItems: ModelX[] = [];

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
            QueryPartEnum.JsonAppliedGivens,
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

      this.updateModelSelectItems();

      this.updateFiltered({
        chartSpaceNodes: this.chartsQuery.getValue().chartSpaceNodes
      });

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

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('?')[0].split('/');
      this.lastUrl = ar[ar.length - 1];
      this.updateSelectedChartIdFromUrl({ url: x.url });
      this.updateFiltered({
        chartSpaceNodes: this.chartsQuery.getValue().chartSpaceNodes
      });
      this.cd.detectChanges();
    })
  );

  chartIsExpanded = true;
  filtersIsExpanded = false;
  dataIsExpanded = true;

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
  canAccessChartModel = true;

  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;

      this.canAccessChartModel =
        this.chart?.tiles?.[0]?.hasAccessToModel !== false;

      this.updateChartAccessControls();

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

      if (this.chart.chartId !== EMPTY_CHART_ID) {
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
      label: 'Pivot Table',
      value: ChartTypeEnum.PivotTable,
      iconPath: 'assets/charts/pivot_table.svg'
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

  updateChartAccessControls() {
    let chartTypeControl = this.chartTypeForm.controls['chartType'];
    let chartTitleControl = this.chartTitleForm.controls['chartTitle'];

    if (this.canAccessChartModel === false) {
      chartTypeControl.disable({ emitEvent: false });
      chartTitleControl.disable({ emitEvent: false });
      return;
    }

    chartTypeControl.enable({ emitEvent: false });
    chartTitleControl.enable({ emitEvent: false });
  }

  actionMapping: IActionMapping = {
    mouse: {}
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'title'
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
    private spaceUiService: SpaceUiService,
    private unitsUiService: UnitsUiService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let ar = this.router.url.split('?')[0].split('/');
    this.lastUrl = ar[ar.length - 1];
    this.updateSelectedChartIdFromUrl({ url: this.router.url });

    let uiState = this.uiQuery.getValue();

    this.timezoneForm.controls['timezone'].setValue(uiState.timezone);

    this.modelsSubscription = this.modelsQuery
      .select()
      .pipe(
        tap(ml => {
          this.models = ml.models;
          this.filteredModels = this.models.filter(model => model.hasAccess);
          this.updateModelSelectItems();

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
              repoId: nav.repoId,
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

  setShowJsonAppliedGivens() {
    if (this.rightIsShow === false) {
      this.rightIsShow = true;
    }
    this.queryPartForm.controls['queryPart'].setValue(
      QueryPartEnum.JsonAppliedGivens
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
    this.updateFiltered({
      chartSpaceNodes: this.chartsQuery.getValue().chartSpaceNodes
    });

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

      if (this.refreshProgress < 100) {
        this.cd.detectChanges();
      } else {
        this.refreshProgress = 0;
        this.cd.detectChanges();

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
    if (this.canAccessChartModel === false) {
      return;
    }

    if (this.mconfig.extendedFilters.length > 0) {
      this.filtersIsExpanded = !this.filtersIsExpanded;
    }
  }

  toggleChartPanel() {
    this.chartIsExpanded = !this.chartIsExpanded;
  }

  toggleDataPanel() {
    this.dataIsExpanded = !this.dataIsExpanded;
  }

  goToEditFile() {
    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    let fileIdAr = this.model.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      builderLeft: BuilderLeftEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath })
    });
  }

  limitBlur() {
    if (this.canAccessChartModel === false) {
      return;
    }

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
    if (this.canAccessChartModel === false) {
      return;
    }

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
          timezone: uiState.timezone,
          skipCache: true
        })
        .pipe(
          tap(x => {
            let uiStateB = this.uiQuery.getValue();

            let url = this.router
              .createUrlTree([], {
                relativeTo: this.route,
                queryParams: {
                  timezone: uiStateB.timezone
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
      repoId: nav.repoId,
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
      repoId: nav.repoId,
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
      repoId: nav.repoId,
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
    if (this.canAccessChartModel === false) {
      return;
    }

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
    if (this.canAccessChartModel === false) {
      return;
    }

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

  updateChartPart(item: { chartPart: MconfigChart }) {
    let { chartPart } = item;
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart = Object.assign({}, newMconfig.chart, chartPart);

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
    if (this.canAccessChartModel === false) {
      return;
    }

    this.myDialogService.showChartAddFilter({
      apiService: this.apiService,
      chart: this.chart,
      model: this.model,
      mconfig: this.mconfig,
      parameterAddedFn: () => {
        this.filtersIsExpanded = true;
        this.cd.detectChanges();
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
      this.updateFiltered({
        chartSpaceNodes: this.chartsQuery.getValue().chartSpaceNodes
      });

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

    this.updateFiltered({
      chartSpaceNodes: this.chartsQuery.getValue().chartSpaceNodes
    });

    this.cd.detectChanges();
  }

  updateModelSelectItems() {
    let model = this.modelQuery.getValue();

    let currentModelIsInOptions = this.filteredModels?.some(
      x => x.modelId === model.modelId
    );

    this.modelSelectItems =
      isDefined(model.modelId) &&
      model.hasAccess === false &&
      currentModelIsInOptions !== true
        ? [...(this.filteredModels ?? []), model as ModelX]
        : [...(this.filteredModels ?? [])];
  }

  navToChart(chart: { chartId: string; modelId: string }) {
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

  deleteDraftChart(event: any, chart: ChartUnit) {
    event.stopPropagation();

    this.chartService.deleteDraftCharts({
      chartIds: [chart.chartId]
    });
  }

  chartSaveAs(event: any) {
    event.stopPropagation();

    if (this.canAccessChartModel === false) {
      return;
    }

    this.myDialogService.showChartSaveAs({
      apiService: this.apiService,
      chart: this.chart,
      model: this.model
    });
  }

  updateFiltered(item: { chartSpaceNodes: SpaceNode[] }) {
    let { chartSpaceNodes } = item;

    let nodes = makeCopy(chartSpaceNodes ?? []);

    let searchNodes = this.spaceUiService.pruneEmptySpaceNodes({
      nodes: nodes
    });

    let isSearchDefined = isDefinedAndNotEmpty(this.searchChartsWord);
    let chartMatchedIds: Set<string> | undefined;

    if (isSearchDefined === true) {
      chartMatchedIds = new Set<string>();

      let searchEntries = makeSpaceUnits({
        spaceNodes: searchNodes
      }).map(chart => {
        let title = isDefined(chart.title) ? chart.title : chart.unitId;
        let accessRolesCombined = chart.accessRolesCombined
          .map(x => x.role)
          .join(' ');

        return {
          chart: chart,
          searchText: `${title} ${chart.unitId} ${chart.author ?? ''} ${chart.spaceFullTitle} ${chart.modelLabel ?? ''} ${accessRolesCombined}`
        };
      });

      let haystack = searchEntries.map(entry => entry.searchText);
      let opts = {};
      let uf = new uFuzzy(opts);
      let idxs = uf.filter(haystack, this.searchChartsWord);
      let searchWord = this.searchChartsWord.toLowerCase();
      let matchedIndexes = new Set<number>(idxs ?? []);

      searchEntries.forEach((entry, index) => {
        let searchText = entry.searchText.toLowerCase();
        let isSubstringMatched = searchText.includes(searchWord);

        if (isSubstringMatched === true) {
          matchedIndexes.add(index);
        }
      });

      matchedIndexes.forEach(index => {
        let entry = searchEntries[index];
        chartMatchedIds.add(entry.chart.unitId);
      });
    }

    let visibleNodes = this.spaceUiService.makeVisibleSpaceNodes({
      nodes: searchNodes,
      unitMatchedIds: chartMatchedIds
    });

    let draftCharts = this.charts.filter(x => x.draft === true);

    let filteredChartNodes =
      this.favoritesOnly === true
        ? this.spaceUiService.flattenFavoriteSpaceNodes({ nodes: visibleNodes })
        : visibleNodes;

    let chartsFilteredByWord = makeSpaceUnits({
      spaceNodes: visibleNodes
    }).map(spaceUnit => spaceUnitToChartUnit({ spaceUnit: spaceUnit }));

    this.filteredCharts = [...draftCharts, ...chartsFilteredByWord].sort(
      (a, b) => {
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
      }
    );

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

    let filteredChartNodesByMode =
      this.chartsByModel === true
        ? filteredChartNodes
        : this.removeModelLevelFromChartNodes({ nodes: filteredChartNodes });

    this.filteredChartNodes = this.spaceUiService.markSelectedAncestors({
      nodes: filteredChartNodesByMode,
      selectedUnitId: this.selectedChartId
    });
  }

  updateSelectedChartIdFromUrl(item: { url: string }) {
    let { url } = item;

    let parts = url.split('?')[0].split('/');
    let chartPathIndex = parts.indexOf(PATH_CHART);
    let chartId = parts[chartPathIndex + 1];

    this.selectedChartId =
      chartPathIndex > -1 && isDefined(chartId) ? chartId : undefined;
  }

  removeModelLevelFromChartNodes(item: { nodes: SpaceNodeX[] }): SpaceNodeX[] {
    let { nodes } = item;

    return nodes.reduce((acc: SpaceNodeX[], node) => {
      if (node.type === 'spaceUnit') {
        acc.push(node);

        return acc;
      }

      let children = this.removeModelLevelFromChartNodes({
        nodes: node.children ?? []
      });

      let isModelFolder = isDefined(node.modelId);

      if (isModelFolder === true) {
        acc.push(...children);

        return acc;
      }

      acc.push({
        ...node,
        children: children
      });

      return acc;
    }, []);
  }

  toggleChartsByModel() {
    let newValue = this.chartsByModel !== true;

    this.chartsByModel = newValue;

    this.uiQuery.updatePart({ chartsByModel: newValue });
    this.uiService.setUserUi({ chartsByModel: newValue });

    this.updateFiltered({
      chartSpaceNodes: this.chartsQuery.getValue().chartSpaceNodes
    });

    setTimeout(() => {
      let chartUnit = this.charts?.find(
        x => x.chartId === this.selectedChartId
      );

      if (isDefined(chartUnit)) {
        this.expandChartPath({ chartUnit: chartUnit });
      }
    }, 0);
  }

  collapseChartsTree() {
    this.chartsTree?.treeModel?.collapseAll();
  }

  setFavoritesOnly(item: { event: MouseEvent; favoritesOnly: boolean }) {
    let { event, favoritesOnly } = item;

    event.stopPropagation();

    this.favoritesOnly = favoritesOnly;

    this.updateFiltered({
      chartSpaceNodes: this.chartsQuery.getValue().chartSpaceNodes
    });

    this.cd.detectChanges();
  }

  toggleFavoriteChart(item: { event: MouseEvent; chartId: string }) {
    let { event, chartId } = item;

    let chartsState = this.chartsQuery.getValue();
    let previousChartSpaceNodes = chartsState.chartSpaceNodes;

    let chart = makeSpaceUnits({
      spaceNodes: chartsState.chartSpaceNodes
    }).find(x => x.unitId === chartId) as any;

    let isFavorite = chart?.isFavorite === true;

    let newChartSpaceNodes = this.unitsUiService.updateSpaceUnitFavorite({
      spaceNodes: chartsState.chartSpaceNodes,
      unitId: chartId,
      isFavorite: isFavorite === false
    });

    event.stopPropagation();

    this.chartsQuery.updatePart({
      chartSpaceNodes: newChartSpaceNodes
    });

    this.updateFiltered({
      chartSpaceNodes: this.chartsQuery.getValue().chartSpaceNodes
    });

    this.cd.detectChanges();

    let nav = this.navQuery.getValue();

    let payload: ToBackendSetFavoriteRequestPayload = {
      projectId: nav.projectId,
      type: FavoriteTypeEnum.Chart,
      targetId: chartId,
      isFavorite: isFavorite === false
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSetFavorite,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSetFavoriteResponse) => {
          let isOk = resp.info?.status === ResponseInfoStatusEnum.Ok;

          if (isOk === false) {
            this.chartsQuery.updatePart({
              chartSpaceNodes: previousChartSpaceNodes
            });

            this.updateFiltered({
              chartSpaceNodes: this.chartsQuery.getValue().chartSpaceNodes
            });

            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  chartsTreeNodeOnClick(item: { node: TreeNode }) {
    let { node } = item;

    if (node.data.type === 'spaceFolder') {
      node.toggleActivated();

      if (node.hasChildren) {
        node.toggleExpanded();
      }
    } else {
      let chartUnit = this.filteredCharts.find(
        chart => chart.chartId === node.data.unitId
      );

      if (isDefined(chartUnit)) {
        this.navToChart(chartUnit);
      }
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

  expandSpacePath(item: { space: string }) {
    let { space } = item;

    let isSlashSeparatedSyntheticSpace = [
      this.personalSpaceId,
      this.sharedSpaceId
    ].some(spaceId => space.startsWith(`${spaceId}/`));

    let parts =
      isSlashSeparatedSyntheticSpace === true
        ? space.split('/')
        : space.split('.');

    let currentSpace = '';

    parts.forEach((part, index) => {
      currentSpace =
        index === 0
          ? part
          : isSlashSeparatedSyntheticSpace === true
            ? `${currentSpace}/${part}`
            : `${currentSpace}.${part}`;

      let node = this.chartsTree?.treeModel?.getNodeById(currentSpace);

      if (isDefined(node)) {
        node.expand();
      }
    });
  }

  expandChartPath(item: { chartUnit: ChartUnit }) {
    let { chartUnit } = item;

    if (isDefinedAndNotEmpty(chartUnit.space) === false) {
      return;
    }

    this.expandSpacePath({ space: chartUnit.space });

    if (this.chartsByModel === true && isDefined(chartUnit.modelId)) {
      let modelNodeId = `${chartUnit.space}/model/${chartUnit.modelId}`;
      let node = this.chartsTree?.treeModel?.getNodeById(modelNodeId);

      if (isDefined(node)) {
        node.expand();
      }
    }
  }

  scrollToSelectedChart(item: { isSmooth: boolean }) {
    let { isSmooth } = item;

    if (this.chart) {
      let chartUnit = this.charts?.find(x => x.chartId === this.chart.chartId);

      if (isDefined(chartUnit)) {
        let shouldExpandChartPath =
          this.chart.draft === false && isDefinedAndNotEmpty(chartUnit.space);

        if (shouldExpandChartPath === true) {
          this.expandChartPath({ chartUnit: chartUnit });
        }
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

    this.searchSchemaWord = undefined;
    this.uiQuery.updatePart({ searchSchemaWord: undefined });

    return true;
  }

  ngOnDestroy() {
    this.searchSchemaWord = undefined;
    this.uiQuery.updatePart({ searchSchemaWord: undefined });

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

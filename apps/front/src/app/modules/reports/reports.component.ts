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
import { IRowNode } from 'ag-grid-community';
import { EChartsInitOpts, EChartsOption } from 'echarts';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  combineLatest,
  concatMap,
  filter,
  interval,
  of,
  Subscription,
  take,
  tap
} from 'rxjs';
import { REPORTS_PAGE_TITLE } from '#common/constants/page-titles';
import {
  EMPTY_REPORT_ID,
  MALLOY_FILTER_ANY,
  PATH_REPORTS,
  PATH_REPORTS_LIST,
  PERSONAL_SPACE_ID,
  RESTRICTED_USER_ALIAS,
  SHARED_SPACE_ID
} from '#common/constants/top';
import { REFRESH_LIST } from '#common/constants/top-front';
import { FavoriteTypeEnum } from '#common/enums/favorite-type.enum';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionTsLastCompleteOptionEnum } from '#common/enums/fraction/fraction-ts-last-complete-option.enum';
import { FractionTsUnitEnum } from '#common/enums/fraction/fraction-ts-unit.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { getTimezones } from '#common/functions/get-timezones';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { makeCopy } from '#common/functions/make-copy';
import { makeSpaceUnits } from '#common/functions/space/make-space-units';
import { spaceUnitToReportUnit } from '#common/functions/space/space-unit-to-report-unit';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { ReportX } from '#common/zod/backend/report-x';
import type { SpaceNode } from '#common/zod/backend/space-node';
import type { SpaceNodeX } from '#common/zod/backend/space-node-x';
import type { Fraction } from '#common/zod/blockml/fraction';
import type { Query } from '#common/zod/blockml/query';
import type { DataPoint } from '#common/zod/front/data-point';
import type { DataRow } from '#common/zod/front/data-row';
import type { RefreshItem } from '#common/zod/front/refresh-item';
import type { SeriesPart } from '#common/zod/front/series-part';
import type {
  ToBackendSetFavoriteRequestPayload,
  ToBackendSetFavoriteResponse
} from '#common/zod/to-backend/favorites/to-backend-set-favorite';
import type {
  ToBackendRunQueriesRequestPayload,
  ToBackendRunQueriesResponse
} from '#common/zod/to-backend/queries/to-backend-run-queries';
import type {
  ToBackendGetReportRequestPayload,
  ToBackendGetReportResponse
} from '#common/zod/to-backend/reports/to-backend-get-report';
import { frontFormatTsUnix } from '#front/app/functions/front-format-ts-unix';
import { makeQueryParams } from '#front/app/functions/make-query-params';
import { setValueAndMark } from '#front/app/functions/set-value-and-mark';
import { FilteredReportsQuery } from '#front/app/queries/filtered-reports.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { ReportQuery } from '#front/app/queries/report.query';
import { ReportsQuery } from '#front/app/queries/reports.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { RepChartData, UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { StructReportResolver } from '#front/app/resolvers/struct-report.resolver';
import { ApiService } from '#front/app/services/api.service';
import { DataService } from '#front/app/services/data.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { ReportService } from '#front/app/services/report.service';
import { SpaceUiService } from '#front/app/services/space-ui.service';
import { UiService } from '#front/app/services/ui.service';
import { UnitsUiService } from '#front/app/services/units-ui.service';

export class TimeSpecItem {
  label: string;
  value: TimeSpecEnum;
}

@Component({
  standalone: false,
  selector: 'm-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  personalSpaceId = PERSONAL_SPACE_ID;
  sharedSpaceId = SHARED_SPACE_ID;

  @ViewChild('timeSpecSelect', { static: false })
  timeSpecSelectElement: NgSelectComponent;

  @ViewChild('leftReportsContainer') leftReportsContainer!: ElementRef;

  @ViewChild('reportsTree') reportsTree: TreeComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.timeSpecSelectElement?.close();
  }

  isInitialScrollCompleted = false;

  restrictedUserAlias = RESTRICTED_USER_ALIAS;

  pageTitle = REPORTS_PAGE_TITLE;

  pathReports = PATH_REPORTS;
  pathReportsList = PATH_REPORTS_LIST;

  rowTypeFormula = RowTypeEnum.Formula;
  rowTypeMetric = RowTypeEnum.Metric;
  rowTypeHeader = RowTypeEnum.Header;
  rowTypeEmpty = RowTypeEnum.Empty;

  fractionTypeEnum = FractionTypeEnum;

  fractionTypeTsIsBetween = FractionTypeEnum.TsIsBetween;

  timeSpecYears = TimeSpecEnum.Years;
  timeSpecQuarters = TimeSpecEnum.Quarters;
  timeSpecMonths = TimeSpecEnum.Months;
  timeSpecWeeks = TimeSpecEnum.Weeks;
  timeSpecDays = TimeSpecEnum.Days;
  timeSpecHours = TimeSpecEnum.Hours;
  timeSpecMinutes = TimeSpecEnum.Minutes;
  timeSpecTimestamps = TimeSpecEnum.Timestamps;

  isShow = true;

  isShowLeft = true;

  showMetrics = false;
  filtersIsExpanded = false;

  emptyReportId = EMPTY_REPORT_ID;

  notEmptySelectQueriesLength = 0;

  seriesParts: SeriesPart[] = [];
  dataPoints: DataPoint[] = [];

  refreshProgress = 0;
  refreshSubscription: Subscription;
  refreshId: string;

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

  report: ReportX;
  report$ = this.reportQuery.select().pipe(
    tap(x => {
      this.report = x;

      this.isShow = true;

      this.notEmptySelectQueriesLength = this.report.rows.filter(
        row => isDefined(row.query) && row.mconfig.select.length > 0
      ).length;

      this.isAutoRun = this.uiQuery.getValue().isAutoRun;

      if (this.isAutoRun === true && this.report.reportId !== this.refreshId) {
        this.refreshForm.controls.refresh.setValue(0);
        this.refreshChange();
      }

      this.checkAutoRun();

      this.filteredReportNodes = this.spaceUiService.markSelectedAncestors({
        nodes: this.filteredReportNodes,
        selectedUnitId: this.report?.reportId
      });

      this.cd.detectChanges();

      if (this.report.reportId !== EMPTY_REPORT_ID) {
        this.uiService.setProjectReportLink({ reportId: this.report.reportId });
      }
    })
  );

  refreshForm = this.fb.group({
    refresh: [undefined]
  });

  refreshList: RefreshItem[] = REFRESH_LIST;

  searchMetricsWord: string;
  searchReportsWord: string;
  favoritesOnly = false;

  filteredDraftsLength: number;

  reports: ReportUnit[];

  filteredReports: ReportUnit[];
  filteredReportNodes: SpaceNodeX[] = [];

  pendingExpandSpace: string;

  reports$ = this.reportsQuery.select().pipe(
    tap(x => {
      let previousReports = this.reports ?? [];

      let nonDraftReportUnits = makeSpaceUnits({
        spaceNodes: x.reportSpaceNodes
      }).map(spaceUnit => spaceUnitToReportUnit({ spaceUnit: spaceUnit }));

      this.reports = [...x.reportUnitDrafts, ...nonDraftReportUnits];

      let reportToExpand: ReportUnit;
      let reportToScroll: ReportUnit;

      this.reports.forEach(report => {
        let previousReport = previousReports.find(
          previous => previous.reportId === report.reportId
        );

        let reportDisplaySpace = report.space;

        let previousDisplaySpace = isDefined(previousReport)
          ? previousReport.space
          : undefined;

        let isInitialLoad = previousReports.length === 0;

        let isNewSavedReport =
          isDefined(previousReport) === false && report.draft === false;

        let isSavedFromDraft =
          isDefined(previousReport) === true &&
          previousReport.draft === true &&
          report.draft === false;

        let isDisplaySpaceChanged = previousDisplaySpace !== reportDisplaySpace;

        let shouldExpand =
          isInitialLoad === false &&
          isDefinedAndNotEmpty(reportDisplaySpace) === true &&
          (isNewSavedReport === true ||
            isSavedFromDraft === true ||
            isDisplaySpaceChanged === true);

        if (
          isInitialLoad === false &&
          isDisplaySpaceChanged === true &&
          report.reportId === this.report?.reportId
        ) {
          reportToScroll = report;
        }

        if (
          shouldExpand === true &&
          (isUndefined(reportToExpand) ||
            report.reportId === this.report?.reportId)
        ) {
          reportToExpand = report;
        }
      });

      this.pendingExpandSpace = isDefined(reportToExpand)
        ? reportToExpand.space
        : undefined;

      this.updateFiltered({ reportSpaceNodes: x.reportSpaceNodes });

      if (isDefined(reportToScroll)) {
        this.pendingExpandSpace = undefined;

        setTimeout(() => {
          this.scrollToSelectedReport({ isSmooth: true });
        }, 0);
      } else if (isDefined(this.pendingExpandSpace)) {
        let space = this.pendingExpandSpace;

        this.pendingExpandSpace = undefined;

        setTimeout(() => {
          this.expandSpacePath({ space: space });
        }, 0);
      }

      this.cd.detectChanges();
    })
  );

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

  timeSpecForm = this.fb.group({
    timeSpec: [undefined]
  });

  timeSpecList: TimeSpecItem[] = [
    {
      label: 'Days',
      value: TimeSpecEnum.Days
    },
    {
      label: 'Weeks',
      value: TimeSpecEnum.Weeks
    },
    {
      label: 'Months',
      value: TimeSpecEnum.Months
    },
    {
      label: 'Quarters',
      value: TimeSpecEnum.Quarters
    },
    {
      label: 'Years',
      value: TimeSpecEnum.Years
    },
    {
      label: 'Hours',
      value: TimeSpecEnum.Hours
    },
    {
      label: 'Minutes',
      value: TimeSpecEnum.Minutes
    },
    {
      label: 'Timestamps',
      value: TimeSpecEnum.Timestamps
    }
  ];

  actionMapping: IActionMapping = {
    mouse: {}
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'title'
  };

  eChartInitOpts: any;
  eChartOptions: EChartsOption;

  isCompleted = false;
  lastCompletedQuery: Query;

  completedQueriesAndFormulasLength = 0;
  newQueriesLength = 0;
  runningQueriesLength = 0;
  recordsWithValuesLength = 0;
  selectedDataRowsLength = 0;

  reportChartData$ = combineLatest([
    this.uiQuery.repChartData$,
    this.uiQuery.showMetricsModelName$,
    this.uiQuery.showMetricsTimeFieldName$
  ]).pipe(
    tap(
      ([repChartData, showMetricsModelName, showMetricsTimeFieldName]: [
        RepChartData,
        boolean,
        boolean
      ]) => {
        let newQueriesLength = 0;
        let runningQueriesLength = 0;
        let completedQueriesAndFormulasLength = 0;

        repChartData.rows.forEach(row => {
          if (
            isDefined(row.formula) ||
            (isDefined(row.query) &&
              row.query.status === QueryStatusEnum.Completed)
          ) {
            completedQueriesAndFormulasLength++;
          }

          if (
            isDefined(row.query) &&
            row.query.status === QueryStatusEnum.New
          ) {
            newQueriesLength++;
          }

          if (
            isDefined(row.query) &&
            row.query.status === QueryStatusEnum.Running
          ) {
            runningQueriesLength++;
          }
        });

        this.newQueriesLength = newQueriesLength;
        this.runningQueriesLength = runningQueriesLength;
        this.completedQueriesAndFormulasLength =
          completedQueriesAndFormulasLength;

        let completedQueries = [
          ...repChartData.rows.filter(
            r =>
              isDefined(r.query) && r.query.status === QueryStatusEnum.Completed
          )
        ]
          .map(r => r.query)
          .sort((a, b) =>
            a.lastCompleteTs > b.lastCompleteTs
              ? 1
              : b.lastCompleteTs > a.lastCompleteTs
                ? -1
                : 0
          );

        if (
          this.newQueriesLength === 0 &&
          this.runningQueriesLength === 0 &&
          completedQueries.length > 0
        ) {
          this.isCompleted = true;
          this.lastCompletedQuery =
            completedQueries[completedQueries.length - 1];
        } else {
          this.isCompleted = false;
          this.lastCompletedQuery = undefined;
        }

        let dataPoints: DataPoint[] = [];

        let recordsWithValuesLength = 0;

        if (repChartData.rows.length > 0) {
          let trimmedColumns = this.report.isTimeColumnsLimitExceeded
            ? repChartData.columns
            : repChartData.firstDataTimeColumnIndex > 0
              ? repChartData.columns.filter(
                  (c, i) =>
                    i >= repChartData.firstDataTimeColumnIndex &&
                    i <= repChartData.lastDataTimeColumnIndex
                )
              : repChartData.columns;

          dataPoints = trimmedColumns
            .filter(column => column.columnId !== 0)
            .map(column => {
              let dataPoint: any = {
                columnId: column.columnId,
                columnLabel: column.label
              };

              repChartData.rows.forEach(row => {
                let rowName = this.dataService.metricsMakeRowName({
                  row: row,
                  showMetricsModelName: showMetricsModelName,
                  showMetricsTimeFieldName: showMetricsTimeFieldName
                });

                let record = row.records.find(
                  rec => rec.key === column.columnId
                );

                dataPoint[rowName] = record?.value;

                if (row.showChart === true && isDefined(record?.value)) {
                  recordsWithValuesLength++;
                }
              });

              return dataPoint;
            });
        }

        this.recordsWithValuesLength = recordsWithValuesLength;

        this.selectedDataRowsLength = repChartData.rows.filter(
          row =>
            row.showChart === true &&
            [RowTypeEnum.Metric, RowTypeEnum.Formula].indexOf(row.rowType) > -1
        ).length;

        this.eChartInitOpts = {
          renderer: 'svg'
        } as EChartsInitOpts;

        this.seriesParts = [];

        let yAxis =
          this.report.chart.series.map(x => x.yAxisIndex).filter(yi => yi > 0)
            .length === 0
            ? [this.report.chart.yAxis[0]]
            : this.report.chart.yAxis;

        this.eChartOptions = (<EChartsOption>{
          animation: false,
          useUTC: true,
          grid: {
            left: 100,
            right:
              this.report.chart.series
                .map(x => x.yAxisIndex)
                .filter(yi => yi > 0).length > 0
                ? 100
                : 50,
            top: 95,
            bottom: 35
          },
          textStyle: {
            fontFamily: 'sans-serif'
          },
          legend: {
            top: 20,
            padding: [0, 0, 0, 0],
            textStyle: {
              fontSize: 15,
              fontFamily: "'Montserrat', sans-serif"
            }
          },
          tooltip: {
            confine: true,
            trigger: 'axis',
            order: 'valueDesc',
            valueFormatter: (value: any) =>
              `${isDefined(value) ? value.toFixed(2) : 'Null'}`
          },
          xAxis: {
            type: 'time',
            axisLabel:
              [
                TimeSpecEnum.Hours,
                TimeSpecEnum.Minutes,
                TimeSpecEnum.Timestamps
              ].indexOf(this.uiQuery.getValue().timeSpec) > -1
                ? { fontSize: 13 }
                : {
                    fontSize: 13,
                    formatter: (value: any) => {
                      let timeSpec = this.uiQuery.getValue().timeSpec;

                      return frontFormatTsUnix({
                        timeSpec: timeSpec,
                        unixTimeZoned: value / 1000
                      });
                    }
                  }
          },
          yAxis: yAxis.map(y => {
            (y as any).type = 'value';
            (y as any).axisLabel = {
              fontSize: 14
            };
            return y;
          }),
          series:
            repChartData.rows.length === 0
              ? []
              : this.report.chart.series.map(chartSeriesElement => {
                  let seriesRow = repChartData.rows
                    .filter(
                      row =>
                        row.showChart === true &&
                        [RowTypeEnum.Metric, RowTypeEnum.Formula].indexOf(
                          row.rowType
                        ) > -1
                    )
                    .find(row => row.rowId === chartSeriesElement.dataRowId);

                  let seriesElement = this.dataService.metricsRowToSeries({
                    isMiniChart: false,
                    row: seriesRow,
                    dataPoints: dataPoints,
                    chartSeriesElement: chartSeriesElement,
                    showMetricsModelName: showMetricsModelName,
                    showMetricsTimeFieldName: showMetricsTimeFieldName
                  });

                  let seriesPart: SeriesPart = {
                    seriesRowId: seriesRow.rowId,
                    seriesRowName: seriesRow.name,
                    isMetric: seriesRow.rowType === RowTypeEnum.Metric,
                    showMetricsModelName: showMetricsModelName,
                    showMetricsTimeFieldName: showMetricsTimeFieldName,
                    seriesName: seriesElement.name.toString(),
                    partNodeLabel: seriesRow.partNodeLabel,
                    partFieldLabel: seriesRow.partFieldLabel,
                    timeNodeLabel: seriesRow.timeNodeLabel,
                    timeFieldLabel: seriesRow.timeFieldLabel,
                    topLabel: seriesRow.topLabel
                  };

                  this.seriesParts.push(seriesPart);

                  return seriesElement;
                })
        }) as EChartsOption;

        this.dataPoints = dataPoints;

        this.uiQuery.updatePart({
          chartPointsData: {
            dataPoints: dataPoints,
            newQueriesLength: newQueriesLength,
            runningQueriesLength: runningQueriesLength
          }
        });

        this.cd.detectChanges();
      }
    )
  );

  fractions: Fraction[] = [];
  showMetricsModelName = false;
  showMetricsTimeFieldName = false;
  showMetricsChart = false;

  reportSelectedNodes: any[] = [];
  reportSelectedNode: IRowNode<DataRow>;

  formulaForm: FormGroup = this.fb.group({
    formula: [undefined, [Validators.required]]
  });

  nameForm: FormGroup = this.fb.group({
    name: [undefined, [Validators.required]]
  });

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.fractions = [x.timeRangeFraction];

      this.showMetricsModelName = x.showMetricsModelName;
      this.showMetricsTimeFieldName = x.showMetricsTimeFieldName;
      this.showMetricsChart = x.showMetricsChart;
      this.reportSelectedNodes = x.reportSelectedNodes;

      this.reportSelectedNode =
        x.reportSelectedNodes.length === 1
          ? x.reportSelectedNodes[0]
          : undefined;

      if (isDefined(this.reportSelectedNode)) {
        if (this.reportSelectedNode.data.rowType === RowTypeEnum.Formula) {
          setValueAndMark({
            control: this.formulaForm.controls['formula'],
            value: this.reportSelectedNode.data.formula
          });
        }

        if (
          this.reportSelectedNode.data.rowType !== RowTypeEnum.Empty &&
          this.reportSelectedNode.data.rowType !== RowTypeEnum.Metric
        ) {
          setValueAndMark({
            control: this.nameForm.controls['name'],
            value: this.reportSelectedNode.data.name
          });
        }
      }

      this.cd.detectChanges();
    })
  );

  checkRunning$: Subscription;

  isRunButtonPressed = false;

  metricsRunButtonSpinnerName = 'metricsRunButtonSpinnerName';

  runButtonTimerSubscription: Subscription;

  private timer: any;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('?')[0].split('/');
      this.lastUrl = ar[ar.length - 1];
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

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private reportsQuery: ReportsQuery,
    private filteredReportsQuery: FilteredReportsQuery,
    private reportQuery: ReportQuery,
    private uiQuery: UiQuery,
    private memberQuery: MemberQuery,
    private userQuery: UserQuery,
    private structQuery: StructQuery,
    private location: Location,
    private router: Router,
    private navQuery: NavQuery,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private uiService: UiService,
    private reportService: ReportService,
    private dataService: DataService,
    private spaceUiService: SpaceUiService,
    private unitsUiService: UnitsUiService,
    private navigateService: NavigateService,
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private structRepResolver: StructReportResolver,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let ar = this.router.url.split('?')[0].split('/');
    this.lastUrl = ar[ar.length - 1];

    let uiState = this.uiQuery.getValue();

    this.timezoneForm.controls['timezone'].setValue(uiState.timezone);
    this.timeSpecForm.controls['timeSpec'].setValue(uiState.timeSpec);
    this.fractions = [uiState.timeRangeFraction];

    setTimeout(() => {
      this.scrollToSelectedReport({ isSmooth: false });
    });

    this.startCheckRunning();
  }

  startCheckRunning() {
    this.checkRunning$ = interval(2000)
      .pipe(
        concatMap(() => {
          if (
            this.report?.rows
              .filter(row => isDefined(row.query))
              .map(row => row.query.status)
              .indexOf(QueryStatusEnum.Running) > -1
          ) {
            return this.getRepObservable();
          } else {
            return of(1);
          }
        })
      )
      .subscribe();
  }

  stopCheckRunning() {
    if (isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }

  getRepObservable() {
    let uiState = this.uiQuery.getValue();
    let nav = this.navQuery.getValue();

    let payload: ToBackendGetReportRequestPayload = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      reportId: this.report.reportId,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetReport,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetReportResponse) => {
          if (
            resp.info?.status === ResponseInfoStatusEnum.Ok &&
            this.report.reportId === resp.payload.report.reportId
          ) {
            this.memberQuery.update(resp.payload.userMember);

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.reportQuery.update(resp.payload.report);
          }
        })
      );
  }

  run() {
    this.stopCheckRunning();

    this.isRunButtonPressed = true;
    this.spinner.show(this.metricsRunButtonSpinnerName);
    this.cd.detectChanges();

    let nav = this.navQuery.getValue();

    let payload: ToBackendRunQueriesRequestPayload = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: this.report.rows
        .filter(row => isDefined(row.query) && row.mconfig.select.length > 0)
        .map(row => row.mconfig.mconfigId)
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
              runningQueries
                .map(y => y.queryId)
                .some(qId =>
                  this.report.rows
                    .filter(r => isDefined(r.query))
                    .map(r => r.query.queryId)
                    .includes(qId)
                )
            ) {
              let tReport = makeCopy(this.report);

              tReport.rows
                .filter(row => isDefined(row.query))
                .forEach(row => {
                  let runningQuery = runningQueries.find(
                    q => q.queryId === row.query.queryId
                  );

                  if (isDefined(runningQuery)) {
                    row.query = runningQuery;
                  }
                });

              this.reportQuery.update(tReport);
            } else {
              this.getRepObservable().pipe(take(1)).subscribe();
            }
          }
          this.spinner.hide(this.metricsRunButtonSpinnerName);
          this.isRunButtonPressed = false;
          this.cd.detectChanges();
        }),
        tap(() => this.startCheckRunning()),
        take(1)
      )
      .subscribe();
  }

  timezoneChange() {
    (document.activeElement as HTMLElement).blur();

    let timezone = this.timezoneForm.controls['timezone'].value;

    this.uiQuery.updatePart({ timezone: timezone });
    this.uiService.setUserUi({ timezone: timezone });

    if (
      this.lastUrl !== this.pathReports &&
      this.lastUrl !== this.pathReportsList
    ) {
      this.getReport();
    }
  }

  timeSpecChange(timeSpecValue?: TimeSpecEnum) {
    if (timeSpecValue === this.timeSpecForm.controls['timeSpec'].value) {
      return;
    }

    if (isDefined(timeSpecValue)) {
      this.timeSpecForm.controls['timeSpec'].setValue(timeSpecValue);
    }

    let timeSpec = this.timeSpecForm.controls['timeSpec'].value;

    let fraction = this.fractions[0];

    if (fraction.type === FractionTypeEnum.TsIsInLast) {
      let tsLastUnit =
        timeSpec === TimeSpecEnum.Timestamps
          ? FractionTsUnitEnum.Minutes
          : timeSpec;

      let mBrick =
        fraction.tsLastCompleteOption ===
        FractionTsLastCompleteOptionEnum.CompleteWithCurrent
          ? `f\`${fraction.tsLastValue} ${tsLastUnit}\``
          : fraction.tsLastCompleteOption ===
              FractionTsLastCompleteOptionEnum.Complete
            ? `f\`last ${fraction.tsLastValue} ${tsLastUnit}\``
            : MALLOY_FILTER_ANY;

      let newFraction: Fraction = {
        brick: mBrick,
        parentBrick: mBrick,
        operator: FractionOperatorEnum.Or,
        type: fraction.type,
        tsLastValue: fraction.tsLastValue,
        tsLastUnit: tsLastUnit,
        tsLastCompleteOption: fraction.tsLastCompleteOption
      };

      this.uiQuery.updatePart({
        timeSpec: timeSpec,
        timeRangeFraction: newFraction
      });
    } else if (fraction.type === FractionTypeEnum.TsIsInNext) {
      let tsNextUnit =
        timeSpec === TimeSpecEnum.Timestamps
          ? FractionTsUnitEnum.Minutes
          : timeSpec;

      let mBrick = `f\`next ${fraction.tsNextValue} ${tsNextUnit}\``;

      let newFraction: Fraction = {
        brick: mBrick,
        parentBrick: mBrick,
        operator: FractionOperatorEnum.Or,
        type: fraction.type,
        tsNextValue: fraction.tsNextValue,
        tsNextUnit: tsNextUnit
      };

      this.uiQuery.updatePart({
        timeSpec: timeSpec,
        timeRangeFraction: newFraction
      });
    } else {
      this.uiQuery.updatePart({ timeSpec: timeSpec });
    }

    this.getReport();
  }

  fractionUpdate(event$: any) {
    this.uiQuery.updatePart({ timeRangeFraction: event$.fraction });
    this.getReport();
  }

  getReport() {
    let uiState = this.uiQuery.getValue();

    this.structRepResolver
      .resolveRoute({
        route: this.route.children[0].snapshot,
        showSpinner: true,
        timezone: uiState.timezone,
        timeSpec: uiState.timeSpec,
        timeRangeFractionBrick: uiState.timeRangeFraction.brick,
        skipCache: true
      })
      .pipe(
        tap(x => {
          let uiStateB = this.uiQuery.getValue();

          let url = this.router
            .createUrlTree([], {
              relativeTo: this.route,
              queryParams: makeQueryParams({
                timezone: uiStateB.timezone,
                timeSpec: uiStateB.timeSpec,
                timeRangeFraction: uiStateB.timeRangeFraction
              })
            })
            .toString();

          this.location.go(url);
        }),
        take(1)
      )
      .subscribe();
  }

  setShowMetrics() {
    if (this.isExplorer === false) {
      return;
    }

    if (this.showMetrics === true) {
      return;
    }

    this.showMetrics = true;
    this.cd.detectChanges();
  }

  setShowReports() {
    if (this.showMetrics === false) {
      return;
    }

    this.showMetrics = false;
    this.cd.detectChanges();

    setTimeout(() => {
      this.scrollToSelectedReport({ isSmooth: true });
    });
  }

  toggleFiltersPanel() {
    this.filtersIsExpanded = !this.filtersIsExpanded;
  }

  addFilter() {
    this.filtersIsExpanded = true;

    this.myDialogService.showReportAddFilter({
      reportService: this.reportService,
      report: this.report,
      apiService: this.apiService
    });
  }

  navToReport(report: { reportId: string }) {
    if (this.reportSelectedNodes.length > 0) {
      this.isShow = false;
      this.uiQuery.getValue().gridApi.deselectAll();
    }

    this.navigateService.navigateToReport({
      reportId: report.reportId
    });
  }

  deleteDrafts() {
    this.reportService.deleteDraftReports({
      reportIds: this.reports
        .filter(report => report.draft === true)
        .map(report => report.reportId)
    });
  }

  deleteDraftReport(event: any, report: ReportUnit) {
    event.stopPropagation();
    this.reportService.deleteDraftReports({ reportIds: [report.reportId] });
  }

  reportSaveAs(event: any) {
    event.stopPropagation();

    this.myDialogService.showReportSaveAs({
      apiService: this.apiService,
      reports: this.reports.filter(
        x => x.draft === false && x.reportId !== EMPTY_REPORT_ID
      ),
      report: this.report
    });
  }

  searchMetricsWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.uiQuery.updatePart({
        searchMetricsWord: this.searchMetricsWord
      });
    }, 600);
  }

  searchReportsWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.updateFiltered({
        reportSpaceNodes: this.reportsQuery.getValue().reportSpaceNodes
      });

      this.cd.detectChanges();
    }, 600);
  }

  resetMetricsSearch() {
    this.searchMetricsWord = undefined;

    this.uiQuery.updatePart({
      searchMetricsWord: this.searchMetricsWord
    });
  }

  resetReportsSearch() {
    this.searchReportsWord = undefined;

    this.updateFiltered({
      reportSpaceNodes: this.reportsQuery.getValue().reportSpaceNodes
    });

    this.cd.detectChanges();
  }

  reportTreeNodeOnClick(item: { node: TreeNode }) {
    let { node } = item;

    if (node.data.type === 'spaceFolder') {
      node.toggleActivated();

      if (node.hasChildren) {
        node.toggleExpanded();
      }
    } else {
      let report = this.reports.find(x => x.reportId === node.data.unitId);

      if (isDefined(report)) {
        this.navToReport(report);
      }
    }
  }

  collapseReportsTree() {
    this.reportsTree?.treeModel?.collapseAll();
  }

  setFavoritesOnly(item: { event: MouseEvent; favoritesOnly: boolean }) {
    let { event, favoritesOnly } = item;

    event.stopPropagation();

    this.favoritesOnly = favoritesOnly;

    this.updateFiltered({
      reportSpaceNodes: this.reportsQuery.getValue().reportSpaceNodes
    });

    this.cd.detectChanges();
  }

  toggleFavoriteReport(item: { event: MouseEvent; reportId: string }) {
    let { event, reportId } = item;

    let reportsState = this.reportsQuery.getValue();

    let previousReportSpaceNodes = reportsState.reportSpaceNodes;

    let report = makeSpaceUnits({
      spaceNodes: reportsState.reportSpaceNodes
    }).find(x => x.unitId === reportId) as any;

    let isFavorite = report?.isFavorite === true;

    let newReportSpaceNodes = this.unitsUiService.updateSpaceUnitFavorite({
      spaceNodes: reportsState.reportSpaceNodes,
      unitId: reportId,
      isFavorite: isFavorite === false
    });

    event.stopPropagation();

    this.reportsQuery.updatePart({
      reportSpaceNodes: newReportSpaceNodes
    });

    this.updateFiltered({
      reportSpaceNodes: this.reportsQuery.getValue().reportSpaceNodes
    });

    this.cd.detectChanges();

    let nav = this.navQuery.getValue();

    let payload: ToBackendSetFavoriteRequestPayload = {
      projectId: nav.projectId,
      type: FavoriteTypeEnum.Report,
      targetId: reportId,
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
            this.reportsQuery.updatePart({
              reportSpaceNodes: previousReportSpaceNodes
            });

            this.updateFiltered({
              reportSpaceNodes: this.reportsQuery.getValue().reportSpaceNodes
            });

            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
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

      let node = this.reportsTree?.treeModel?.getNodeById(currentSpace);

      if (isDefined(node)) {
        node.expand();
      }
    });
  }

  toggleAutoRun() {
    let newIsAutoRunValue = !this.isAutoRun;

    this.isAutoRun = newIsAutoRunValue;
    this.checkAutoRun();

    this.uiQuery.updatePart({ isAutoRun: newIsAutoRunValue });

    this.cd.detectChanges();
  }

  checkAutoRun() {
    let newQueries = this.report.rows.filter(
      row => isDefined(row.query) && row.query.status === QueryStatusEnum.New
    );

    if (
      this.isAutoRun === true &&
      newQueries.length > 0 &&
      (this.report?.timeRangeFraction.type !== FractionTypeEnum.TsIsBetween ||
        this.report?.rangeStart < this.report?.rangeEnd)
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

    this.refreshId = this.report?.reportId;

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
          this.notEmptySelectQueriesLength > 0 &&
          (this.report?.timeRangeFraction.type !==
            FractionTypeEnum.TsIsBetween ||
            this.report?.rangeStart < this.report?.rangeEnd)
        ) {
          this.run();
        }
      }
    });
  }

  toggleShowLeft() {
    this.isShowLeft = !this.isShowLeft;
  }

  refreshShow() {}

  navToReportsList() {
    if (this.lastUrl !== this.pathReportsList) {
      this.title.setTitle(this.pageTitle);

      this.reportQuery.reset();
      this.uiQuery.updatePart({
        reportSelectedNodes: [],
        gridApi: null,
        gridData: [],
        chartPointsData: null,
        repChartData: {
          rows: [],
          columns: [],
          firstDataTimeColumnIndex: -1,
          lastDataTimeColumnIndex: -1
        }
      });

      this.navigateService.navigateToReportsList();
    }
  }

  newReport() {
    this.uiService.setProjectReportLink({ reportId: EMPTY_REPORT_ID });

    this.navigateService.navigateToReport({
      reportId: EMPTY_REPORT_ID
    });
  }

  timezoneSearchFn(term: string, timezone: { value: string; label: string }) {
    let haystack = [`${timezone.label}`];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  scrollToSelectedReport(item: { isSmooth: boolean }) {
    let { isSmooth } = item;

    if (this.report && this.isShowLeft === true) {
      let reportUnit = this.reports?.find(
        x => x.reportId === this.report.reportId
      );

      if (
        this.report.draft === false &&
        isDefinedAndNotEmpty(reportUnit?.space)
      ) {
        this.expandSpacePath({ space: reportUnit?.space });
      }

      let selectedElement =
        this.leftReportsContainer.nativeElement.querySelector(
          `[reportId="${this.report.reportId}"]`
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

  updateFiltered(item: { reportSpaceNodes: SpaceNode[] }) {
    let { reportSpaceNodes } = item;

    let nodes = makeCopy(reportSpaceNodes ?? []);

    let searchNodes = this.spaceUiService.pruneEmptySpaceNodes({
      nodes: nodes
    });

    let isSearchDefined = isDefinedAndNotEmpty(this.searchReportsWord);

    let reportMatchedIds: Set<string> | undefined;

    if (isSearchDefined === true) {
      reportMatchedIds = new Set<string>();

      let searchEntries = makeSpaceUnits({
        spaceNodes: searchNodes
      }).map(report => {
        let title = isDefined(report.title) ? report.title : report.unitId;
        let accessRolesCombined = report.accessRolesCombined
          .map(x => x.role)
          .join(' ');

        return {
          report: report,
          searchText: `${title} ${report.unitId} ${report.author ?? ''} ${report.spaceFullTitle} ${accessRolesCombined}`
        };
      });

      let haystack = searchEntries.map(entry => entry.searchText);
      let opts = {};
      let uf = new uFuzzy(opts);
      let idxs = uf.filter(haystack, this.searchReportsWord);
      let searchWord = this.searchReportsWord.toLowerCase();
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
        reportMatchedIds.add(entry.report.unitId);
      });
    }

    let visibleNodes = this.spaceUiService.makeVisibleSpaceNodes({
      nodes: searchNodes,
      unitMatchedIds: reportMatchedIds
    });

    let draftReports = this.reports.filter(x => x.draft === true);

    let filteredReportNodes =
      this.favoritesOnly === true
        ? this.spaceUiService.flattenFavoriteSpaceNodes({ nodes: visibleNodes })
        : visibleNodes;

    let reportsFilteredByWord = makeSpaceUnits({
      spaceNodes: visibleNodes
    }).map(spaceUnit => spaceUnitToReportUnit({ spaceUnit: spaceUnit }));

    this.filteredReports = [...draftReports, ...reportsFilteredByWord].sort(
      (a, b) => {
        let aTitle = (a.title || a.reportId).toUpperCase();
        let bTitle = (b.title || b.reportId).toUpperCase();

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

    this.filteredReportsQuery.update({
      filteredReports: this.filteredReports
    });

    this.filteredDraftsLength = this.filteredReports.filter(
      y => y.draft === true
    ).length;

    this.filteredReportNodes = this.spaceUiService.markSelectedAncestors({
      nodes: filteredReportNodes,
      selectedUnitId: this.report?.reportId
    });
  }

  ngOnDestroy() {
    this.searchMetricsWord = undefined;
    this.uiQuery.updatePart({ searchMetricsWord: undefined });

    this.refreshSubscription?.unsubscribe();

    this.stopCheckRunning();

    this.reportsQuery.reset();
    this.reportQuery.reset();

    this.uiQuery.updatePart({
      reportSelectedNodes: [],
      gridApi: null,
      gridData: [],
      chartPointsData: null,
      repChartData: {
        rows: [],
        columns: [],
        firstDataTimeColumnIndex: -1,
        lastDataTimeColumnIndex: -1
      }
    });
  }
}

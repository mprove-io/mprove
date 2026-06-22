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
  RESTRICTED_USER_ALIAS
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
import type { ReportNode } from '#common/zod/backend/report-node';
import type { ReportX } from '#common/zod/backend/report-x';
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
import { UiService } from '#front/app/services/ui.service';

export class TimeSpecItem {
  label: string;
  value: TimeSpecEnum;
}

type ReportTreeNode =
  | (Extract<ReportNode, { type: 'space' }> & {
      children: ReportTreeNode[];
      isMatched?: boolean;
      isSynthetic?: boolean;
      isSelectedReportAncestor?: boolean;
    })
  | (Extract<ReportNode, { type: 'report' }> & {
      report?: ReportX;
      isMatched?: boolean;
      isFavorite?: boolean;
    });

type ReportSpaceNode = Extract<ReportNode, { type: 'space' }>;

@Component({
  standalone: false,
  selector: 'm-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  myReportsSpaceId = '__my_reports__';
  uncategorizedReportsSpaceId = '__uncategorized_reports__';
  personalReportsSpaceId = '__personal_reports__';
  sharedReportsSpaceId = '__shared_reports__';

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

      this.cd.detectChanges();

      if (this.report.reportId !== EMPTY_REPORT_ID) {
        this.uiService.setProjectReportLink({ reportId: this.report.reportId });
      }

      this.filteredReportNodes = this.markSelectedReportAncestors({
        nodes: this.filteredReportNodes
      });
    })
  );

  refreshForm = this.fb.group({
    refresh: [undefined]
  });

  refreshList: RefreshItem[] = REFRESH_LIST;

  searchMetricsWord: string;
  searchReportsWord: string;
  favoriteReportIds: string[] = [];
  favoritesOnly = false;

  filteredDraftsLength: number;

  reports: ReportX[];
  reportsFilteredByWord: ReportX[];
  filteredReports: ReportX[];
  filteredReportNodes: ReportTreeNode[] = [];
  pendingExpandSpace: string;

  reports$ = this.reportsQuery.select().pipe(
    tap(x => {
      let previousReports = this.reports ?? [];
      this.reports = x.reports;
      this.favoriteReportIds = x.favoriteReportIds ?? [];

      let reportToExpand = this.reports.find(report => {
        let previousReport = previousReports.find(
          previous => previous.reportId === report.reportId
        );
        let reportDisplaySpace = this.getReportDisplaySpace({
          report: report
        });

        let previousDisplaySpace = isDefined(previousReport)
          ? this.getReportDisplaySpace({ report: previousReport })
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

        return shouldExpand;
      });

      this.pendingExpandSpace = isDefined(reportToExpand)
        ? this.getReportDisplaySpace({ report: reportToExpand })
        : undefined;

      this.updateFilteredReportsAndReportNodes({ reportNodes: x.reportNodes });

      this.cd.detectChanges();

      this.expandPendingSpace();
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

  navToReport(report: ReportX) {
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

  deleteDraftReport(event: any, report: ReportX) {
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
      this.updateFilteredReportsAndReportNodes({
        reportNodes: this.reportsQuery.getValue().reportNodes
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
    this.updateFilteredReportsAndReportNodes({
      reportNodes: this.reportsQuery.getValue().reportNodes
    });

    this.cd.detectChanges();
  }

  updateFilteredReportsAndReportNodes(item: { reportNodes: ReportNode[] }) {
    let { reportNodes } = item;
    let searchedNodes = this.getSearchedReportNodes({
      reportNodes: reportNodes
    });

    this.updateFilteredReports({ nodes: searchedNodes });
    this.setFilteredReportNodes({ nodes: searchedNodes });
  }

  updateFilteredReports(item: { nodes: ReportTreeNode[] }) {
    let { nodes } = item;
    let draftReports = this.reports.filter(x => x.draft === true);
    let nonDraftReports = this.reports.filter(x => x.draft === false);
    let isSearchDefined = isDefinedAndNotEmpty(this.searchReportsWord);

    let reportIds = this.getReportIdsFromNodes({ nodes: nodes });
    let reportIdSet = new Set(reportIds);

    this.reportsFilteredByWord =
      isSearchDefined === true
        ? nonDraftReports.filter(report => reportIdSet.has(report.reportId))
        : nonDraftReports;

    this.filteredReports = [...draftReports, ...this.reportsFilteredByWord];

    this.filteredReports = this.filteredReports.sort((a, b) => {
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
    });

    this.filteredReportsQuery.update({
      filteredReports: this.filteredReports
    });

    this.filteredDraftsLength = this.filteredReports.filter(
      y => y.draft === true
    ).length;
  }

  reportTreeNodeOnClick(item: { node: TreeNode }) {
    let { node } = item;

    if (node.data.type === 'space') {
      node.toggleActivated();

      if (node.hasChildren) {
        node.toggleExpanded();
      }
    } else {
      let report = this.reports.find(x => x.reportId === node.data.reportId);

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

    this.makeFilteredReportNodes({
      reportNodes: this.reportsQuery.getValue().reportNodes
    });

    this.cd.detectChanges();
  }

  toggleFavoriteReport(item: { event: MouseEvent; reportId: string }) {
    let { event, reportId } = item;

    let isFavorite = this.favoriteReportIds.indexOf(reportId) > -1;

    let newFavoriteReportIds = isFavorite
      ? this.favoriteReportIds.filter(id => id !== reportId)
      : [...this.favoriteReportIds, reportId];

    let previousFavoriteReportIds = this.favoriteReportIds;

    event.stopPropagation();

    this.favoriteReportIds = newFavoriteReportIds;

    this.reportsQuery.updatePart({
      favoriteReportIds: newFavoriteReportIds
    });

    this.makeFilteredReportNodes({
      reportNodes: this.reportsQuery.getValue().reportNodes
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
            this.favoriteReportIds = previousFavoriteReportIds;
            this.reportsQuery.updatePart({
              favoriteReportIds: previousFavoriteReportIds
            });

            this.makeFilteredReportNodes({
              reportNodes: this.reportsQuery.getValue().reportNodes
            });

            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  makeFilteredReportNodes(item: { reportNodes: ReportNode[] }) {
    let { reportNodes } = item;
    let searchedNodes = this.getSearchedReportNodes({
      reportNodes: reportNodes
    });

    this.setFilteredReportNodes({ nodes: searchedNodes });
  }

  getSearchedReportNodes(item: {
    reportNodes: ReportNode[];
  }): ReportTreeNode[] {
    let { reportNodes } = item;
    let searchNodes = this.makeReportSearchNodes({
      reportNodes: reportNodes
    });

    let enrichedNodes = this.enrichReportNodes({ nodes: searchNodes });
    let isSearchDefined = isDefinedAndNotEmpty(this.searchReportsWord);
    let reportMatchedIds = new Set<string>();

    if (isSearchDefined === true) {
      let nonDraftReports = this.reports.filter(x => x.draft === false);
      let haystack = nonDraftReports.map(report =>
        this.getReportSearchText({ report: report })
      );
      let opts = {};
      let uf = new uFuzzy(opts);
      let idxs = uf.filter(haystack, this.searchReportsWord);

      reportMatchedIds = new Set(
        idxs != null && idxs.length > 0
          ? idxs.map((idx: number): string => nonDraftReports[idx].reportId)
          : []
      );
    }

    return isSearchDefined === true
      ? this.filterReportNodes({
          nodes: enrichedNodes,
          reportMatchedIds: reportMatchedIds
        })
      : enrichedNodes;
  }

  setFilteredReportNodes(item: { nodes: ReportTreeNode[] }) {
    let { nodes } = item;

    this.filteredReportNodes = nodes;

    this.filteredReportNodes =
      this.favoritesOnly === true
        ? this.flattenFavoriteReportNodes({ nodes: this.filteredReportNodes })
        : this.filteredReportNodes;

    this.filteredReportNodes = this.markSelectedReportAncestors({
      nodes: this.filteredReportNodes
    });
  }

  makeReportSearchNodes(item: { reportNodes: ReportNode[] }): ReportNode[] {
    let { reportNodes } = item;
    let member = this.memberQuery.getValue();
    let isAdmin = member.isAdmin;
    let isFileEditor = member.isEditor;

    let nodes = makeCopy(reportNodes ?? []);

    nodes = this.addMyReportsNode({ nodes: nodes });

    nodes = this.addUncategorizedReportsNode({ nodes: nodes });

    nodes =
      isAdmin === true || isFileEditor === true
        ? this.addPersonalReportsNode({ nodes: nodes })
        : nodes;

    nodes = this.addSharedReportsNode({ nodes: nodes });

    return this.pruneEmptySpaceNodes({
      nodes: nodes
    });
  }

  getReportSearchText(item: { report: ReportX }): string {
    let { report } = item;
    let title = isDefined(report.title) ? report.title : report.reportId;
    let accessRolesCombined = report.accessRolesCombined.join(' ');

    return `${title} ${report.reportId} ${report.author ?? ''} ${accessRolesCombined}`;
  }

  getReportIdsFromNodes(item: { nodes: ReportTreeNode[] }): string[] {
    let { nodes } = item;

    return nodes.reduce((acc: string[], node) => {
      if (node.type === 'report') {
        acc.push(node.reportId);

        return acc;
      }

      let childrenReportIds = this.getReportIdsFromNodes({
        nodes: node.children ?? []
      });

      acc.push(...childrenReportIds);

      return acc;
    }, []);
  }

  pruneEmptySpaceNodes(item: { nodes: ReportNode[] }): ReportNode[] {
    let { nodes } = item;

    return nodes
      .map(node => {
        if (node.type === 'report') {
          return node;
        }

        return {
          ...node,
          children: this.pruneEmptySpaceNodes({ nodes: node.children ?? [] })
        };
      })
      .filter(node => {
        if (node.type === 'report') {
          return true;
        }

        return node.children.length > 0;
      });
  }

  addMyReportsNode(item: { nodes: ReportNode[] }): ReportNode[] {
    let { nodes } = item;

    let alias = this.userQuery.getValue().alias;

    if (isDefinedAndNotEmpty(alias) === false) {
      return nodes;
    }

    let myReports = this.reports.filter(
      report =>
        report.draft === false &&
        report.author === alias &&
        isDefinedAndNotEmpty(report.space) === false
    );

    if (myReports.length === 0) {
      return nodes;
    }

    let myReportIds = myReports.map(report => report.reportId);
    let nodesWithoutMyReports = this.removeReportNodes({
      nodes: nodes,
      reportIds: myReportIds
    });

    let myReportNodes = myReports
      .map(report => {
        let reportNode: ReportNode = {
          type: 'report',
          id: report.reportId,
          reportId: report.reportId,
          title: report.title || report.reportId,
          space: this.myReportsSpaceId,
          accessRoles: report.accessRoles,
          accessRolesCombined: report.accessRolesCombined
        };

        return reportNode;
      })
      .sort((a, b) => {
        let aTitle = a.title.toLowerCase();
        let bTitle = b.title.toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      });

    let myReportsNode: ReportNode = {
      type: 'space',
      id: this.myReportsSpaceId,
      space: this.myReportsSpaceId,
      filePath: '',
      title: 'My Reports',
      accessRoles: [],
      accessRolesCombined: [],
      children: myReportNodes
    };

    return [myReportsNode, ...nodesWithoutMyReports];
  }

  addUncategorizedReportsNode(item: { nodes: ReportNode[] }): ReportNode[] {
    let { nodes } = item;

    let uncategorizedReports = this.reports.filter(report => {
      let isNotDraft = report.draft === false;
      let hasAuthor = isDefinedAndNotEmpty(report.author);
      let hasNoSpace = isDefinedAndNotEmpty(report.space) === false;

      return isNotDraft && hasAuthor === false && hasNoSpace;
    });

    if (uncategorizedReports.length === 0) {
      return nodes;
    }

    let uncategorizedReportIds = uncategorizedReports.map(
      report => report.reportId
    );

    let nodesWithoutUncategorizedReports = this.removeReportNodes({
      nodes: nodes,
      reportIds: uncategorizedReportIds
    });

    let uncategorizedReportsNode: ReportSpaceNode = this.makeSyntheticSpaceNode(
      {
        id: this.uncategorizedReportsSpaceId,
        title: 'Uncategorized'
      }
    );

    uncategorizedReportsNode.children = uncategorizedReports
      .map(report => {
        let reportNode: ReportNode = {
          type: 'report',
          id: report.reportId,
          reportId: report.reportId,
          title: report.title || report.reportId,
          space: this.uncategorizedReportsSpaceId,
          accessRoles: report.accessRoles,
          accessRolesCombined: report.accessRolesCombined
        };

        return reportNode;
      })
      .sort((a, b) => {
        let aTitle = a.title.toLowerCase();
        let bTitle = b.title.toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      });

    let lastSpaceIndex = -1;

    nodesWithoutUncategorizedReports.forEach((node, index) => {
      if (node.type === 'space') {
        lastSpaceIndex = index;
      }
    });

    if (lastSpaceIndex < 0) {
      return [uncategorizedReportsNode, ...nodesWithoutUncategorizedReports];
    }

    return [
      ...nodesWithoutUncategorizedReports.slice(0, lastSpaceIndex + 1),
      uncategorizedReportsNode,
      ...nodesWithoutUncategorizedReports.slice(lastSpaceIndex + 1)
    ];
  }

  addSharedReportsNode(item: { nodes: ReportNode[] }): ReportNode[] {
    let { nodes } = item;

    let alias = this.userQuery.getValue().alias;

    let sharedReports = this.reports.filter(report => {
      let isNotDraft = report.draft === false;
      let hasAuthor = isDefinedAndNotEmpty(report.author);
      let isNotMyReport = hasAuthor === true && report.author !== alias;
      let hasNoSpace = isDefinedAndNotEmpty(report.space) === false;
      let hasAccessRoles = report.accessRoles.length > 0;

      return (
        isNotDraft && hasAuthor && isNotMyReport && hasNoSpace && hasAccessRoles
      );
    });

    if (sharedReports.length === 0) {
      return nodes;
    }

    let sharedReportIds = sharedReports.map(report => report.reportId);

    let nodesWithoutSharedReports = this.removeReportNodes({
      nodes: nodes,
      reportIds: sharedReportIds
    });

    let sharedReportsNode: ReportSpaceNode = this.makeSyntheticSpaceNode({
      id: this.sharedReportsSpaceId,
      title: 'Shared'
    });

    sharedReports
      .sort((a, b) => {
        let aTitle = (a.title || a.reportId).toLowerCase();
        let bTitle = (b.title || b.reportId).toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      })
      .forEach(report => {
        let displaySpace = `${this.sharedReportsSpaceId}/${report.author}`;

        let authorNode = sharedReportsNode.children.find(
          child => child.type === 'space' && child.id === displaySpace
        ) as ReportSpaceNode | undefined;

        if (isDefined(authorNode) === false) {
          authorNode = this.makeSyntheticSpaceNode({
            id: displaySpace,
            title: report.author
          });
          sharedReportsNode.children.push(authorNode);
        }

        authorNode.children.push({
          type: 'report',
          id: report.reportId,
          reportId: report.reportId,
          title: report.title || report.reportId,
          space: displaySpace,
          accessRoles: report.accessRoles,
          accessRolesCombined: report.accessRolesCombined
        });
      });

    sharedReportsNode.children = this.sortReportTreeNodes({
      nodes: sharedReportsNode.children
    });

    let lastSpaceIndex = -1;

    nodesWithoutSharedReports.forEach((node, index) => {
      if (node.type === 'space') {
        lastSpaceIndex = index;
      }
    });

    if (lastSpaceIndex < 0) {
      return [sharedReportsNode, ...nodesWithoutSharedReports];
    }

    return [
      ...nodesWithoutSharedReports.slice(0, lastSpaceIndex + 1),
      sharedReportsNode,
      ...nodesWithoutSharedReports.slice(lastSpaceIndex + 1)
    ];
  }

  addPersonalReportsNode(item: { nodes: ReportNode[] }): ReportNode[] {
    let { nodes } = item;

    let alias = this.userQuery.getValue().alias;

    let personalReports = this.reports.filter(report => {
      let isNotDraft = report.draft === false;
      let hasAuthor = isDefinedAndNotEmpty(report.author);
      let isNotMyReport = hasAuthor === true && report.author !== alias;
      let hasNoSpace = isDefinedAndNotEmpty(report.space) === false;
      let hasNoAccessRoles = report.accessRoles.length === 0;

      return (
        isNotDraft &&
        hasAuthor &&
        isNotMyReport &&
        hasNoSpace &&
        hasNoAccessRoles
      );
    });

    if (personalReports.length === 0) {
      return nodes;
    }

    let personalReportIds = personalReports.map(report => report.reportId);

    let nodesWithoutPersonalReports = this.removeReportNodes({
      nodes: nodes,
      reportIds: personalReportIds
    });

    let personalReportsNode: ReportSpaceNode = this.makeSyntheticSpaceNode({
      id: this.personalReportsSpaceId,
      title: 'Personal'
    });

    personalReports
      .sort((a, b) => {
        let aTitle = (a.title || a.reportId).toLowerCase();
        let bTitle = (b.title || b.reportId).toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      })
      .forEach(report => {
        let displaySpace = `${this.personalReportsSpaceId}/${report.author}`;

        let authorNode = personalReportsNode.children.find(
          child => child.type === 'space' && child.id === displaySpace
        ) as ReportSpaceNode | undefined;

        if (isDefined(authorNode) === false) {
          authorNode = this.makeSyntheticSpaceNode({
            id: displaySpace,
            title: report.author
          });
          personalReportsNode.children.push(authorNode);
        }

        authorNode.children.push({
          type: 'report',
          id: report.reportId,
          reportId: report.reportId,
          title: report.title || report.reportId,
          space: displaySpace,
          accessRoles: report.accessRoles,
          accessRolesCombined: report.accessRolesCombined
        });
      });

    personalReportsNode.children = this.sortReportTreeNodes({
      nodes: personalReportsNode.children
    });

    let lastSpaceIndex = -1;

    nodesWithoutPersonalReports.forEach((node, index) => {
      if (node.type === 'space') {
        lastSpaceIndex = index;
      }
    });

    if (lastSpaceIndex < 0) {
      return [personalReportsNode, ...nodesWithoutPersonalReports];
    }

    return [
      ...nodesWithoutPersonalReports.slice(0, lastSpaceIndex + 1),
      personalReportsNode,
      ...nodesWithoutPersonalReports.slice(lastSpaceIndex + 1)
    ];
  }

  makeSyntheticSpaceNode(item: { id: string; title: string }): ReportSpaceNode {
    let { id, title } = item;

    return {
      type: 'space',
      id: id,
      space: id,
      filePath: '',
      title: title,
      accessRoles: [],
      accessRolesCombined: [],
      children: []
    };
  }

  sortReportTreeNodes(item: { nodes: ReportNode[] }): ReportNode[] {
    let { nodes } = item;

    return nodes
      .map(node => {
        if (node.type === 'space') {
          return {
            ...node,
            children: this.sortReportTreeNodes({ nodes: node.children ?? [] })
          };
        }

        return node;
      })
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'space' ? -1 : 1;
        }

        let aTitle = a.title.toLowerCase();
        let bTitle = b.title.toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      });
  }

  removeReportNodes(item: {
    nodes: ReportNode[];
    reportIds: string[];
  }): ReportNode[] {
    let { nodes, reportIds } = item;

    return nodes
      .map(node => {
        if (node.type === 'report') {
          return node;
        }

        return {
          ...node,
          children: this.removeReportNodes({
            nodes: node.children ?? [],
            reportIds: reportIds
          })
        };
      })
      .filter(node => {
        if (node.type === 'space') {
          return true;
        }

        return reportIds.includes(node.reportId) === false;
      });
  }

  expandPendingSpace() {
    let space = this.pendingExpandSpace;

    if (isDefinedAndNotEmpty(space) === false) {
      return;
    }

    this.pendingExpandSpace = undefined;
    this.cd.detectChanges();

    setTimeout(() => {
      this.expandSpacePath({ space: space });
    }, 0);
  }

  expandSpacePath(item: { space: string }) {
    let { space } = item;

    let isSlashSeparatedSyntheticSpace = [
      this.personalReportsSpaceId,
      this.sharedReportsSpaceId
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

  getReportDisplaySpace(item: { report: ReportX }) {
    let { report } = item;
    let alias = this.userQuery.getValue().alias;
    let member = this.memberQuery.getValue();
    let isAdmin = member.isAdmin;
    let isFileEditor = member.isEditor;

    if (
      report.draft === false &&
      isDefinedAndNotEmpty(alias) === true &&
      report.author === alias &&
      isDefinedAndNotEmpty(report.space) === false
    ) {
      return this.myReportsSpaceId;
    }

    let isAuthoredByOtherUser =
      isDefinedAndNotEmpty(report.author) === true && report.author !== alias;

    let isOtherUserAuthoredNoSpaceReport =
      report.draft === false &&
      isAuthoredByOtherUser &&
      isDefinedAndNotEmpty(report.space) === false;

    let isPersonalReport =
      isOtherUserAuthoredNoSpaceReport && report.accessRoles.length === 0;

    let isSharedReport =
      isOtherUserAuthoredNoSpaceReport && report.accessRoles.length > 0;

    if (isPersonalReport && (isAdmin === true || isFileEditor === true)) {
      return `${this.personalReportsSpaceId}/${report.author}`;
    }

    if (isSharedReport) {
      return `${this.sharedReportsSpaceId}/${report.author}`;
    }

    if (
      report.draft === false &&
      isDefinedAndNotEmpty(report.author) === false &&
      isDefinedAndNotEmpty(report.space) === false
    ) {
      return this.uncategorizedReportsSpaceId;
    }

    return report.space;
  }

  markSelectedReportAncestors(item: {
    nodes: ReportTreeNode[];
  }): ReportTreeNode[] {
    let { nodes } = item;
    let selectedReportId = this.report?.reportId;

    return nodes.map(node => {
      if (node.type === 'report') {
        return node;
      }

      let children = this.markSelectedReportAncestors({
        nodes: node.children ?? []
      });

      let isSelectedReportAncestor = children.some(child =>
        child.type === 'report'
          ? child.reportId === selectedReportId
          : child.isSelectedReportAncestor === true
      );

      return {
        ...node,
        children: children,
        isSelectedReportAncestor: isSelectedReportAncestor
      };
    });
  }

  enrichReportNodes(item: { nodes: ReportNode[] }): ReportTreeNode[] {
    let { nodes } = item;

    return nodes.map(node => {
      if (node.type === 'report') {
        let report = this.reports.find(x => x.reportId === node.reportId);

        return {
          ...node,
          report: report,
          isFavorite: this.favoriteReportIds.indexOf(node.reportId) > -1
        };
      }

      return {
        ...node,
        isSynthetic:
          node.id === this.myReportsSpaceId ||
          node.id === this.uncategorizedReportsSpaceId ||
          node.id.startsWith(this.personalReportsSpaceId) ||
          node.id.startsWith(this.sharedReportsSpaceId),
        children: this.enrichReportNodes({ nodes: node.children ?? [] })
      };
    });
  }

  filterReportNodes(item: {
    nodes: ReportTreeNode[];
    reportMatchedIds: Set<string>;
  }): ReportTreeNode[] {
    let { nodes, reportMatchedIds } = item;
    let searchWord = this.searchReportsWord.toLowerCase();

    return nodes
      .map(node => {
        if (node.type === 'report') {
          let searchText = isDefined(node.report)
            ? this.getReportSearchText({ report: node.report }).toLowerCase()
            : `${node.title ?? node.reportId} ${node.reportId} ${node.accessRolesCombined.join(' ')}`.toLowerCase();

          return {
            ...node,
            isMatched:
              reportMatchedIds.has(node.reportId) ||
              searchText.includes(searchWord)
          };
        }

        let alias = this.userQuery.getValue().alias;
        let title = (node.title ?? node.space).toLowerCase();
        let isMyReportsAuthorMatched =
          node.id === this.myReportsSpaceId &&
          isDefinedAndNotEmpty(alias) === true &&
          alias.toLowerCase().includes(searchWord);

        let isSpaceMatched =
          title.includes(searchWord) || isMyReportsAuthorMatched;

        let children = isSpaceMatched
          ? node.children
          : this.filterReportNodes({
              nodes: node.children ?? [],
              reportMatchedIds: reportMatchedIds
            });

        return {
          ...node,
          children: children,
          isMatched: isSpaceMatched || children.length > 0
        };
      })
      .filter(node => node.isMatched === true);
  }

  flattenFavoriteReportNodes(item: {
    nodes: ReportTreeNode[];
  }): ReportTreeNode[] {
    let { nodes } = item;

    return nodes.reduce((acc: ReportTreeNode[], node) => {
      if (node.type === 'report') {
        if (node.isFavorite === true) {
          acc.push({
            ...node,
            isMatched: true
          });
        }

        return acc;
      }

      let children = this.flattenFavoriteReportNodes({
        nodes: node.children ?? []
      });

      acc.push(...children);

      return acc;
    }, []);
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
      let reportDisplaySpace = this.getReportDisplaySpace({
        report: this.report
      });
      let isReportSpaceDefined = isDefinedAndNotEmpty(reportDisplaySpace);

      if (this.report.draft === false && isReportSpaceDefined === true) {
        this.expandSpacePath({ space: reportDisplaySpace });
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

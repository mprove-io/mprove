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
import { IRowNode } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  Subscription,
  combineLatest,
  concatMap,
  filter,
  interval,
  of,
  take,
  tap
} from 'rxjs';
import { makeQueryParams } from '~front/app/functions/make-query-params';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { DataRow } from '~front/app/interfaces/data-row';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { ReportsQuery } from '~front/app/queries/reports.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { RepChartData, UiQuery } from '~front/app/queries/ui.query';
import { StructReportResolver } from '~front/app/resolvers/struct-report.resolver';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { ReportService } from '~front/app/services/report.service';
import { UiService } from '~front/app/services/ui.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import {
  constants,
  constants as frontConstants
} from '~front/barrels/constants';

import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent } from '@ng-select/ng-select';
import { EChartsInitOpts, EChartsOption } from 'echarts';
import { frontFormatTsUnix } from '~front/app/functions/front-format-ts-unix';
import { DataPoint } from '~front/app/interfaces/data-point';
import { RefreshItem } from '~front/app/interfaces/refresh-item';
import { SeriesPart } from '~front/app/interfaces/series-part';
import { FilteredReportsQuery } from '~front/app/queries/filtered-reports.query';
import { DataService } from '~front/app/services/data.service';

export class TimeSpecItem {
  label: string;
  value: common.TimeSpecEnum;
}

@Component({
  standalone: false,
  selector: 'm-reports',
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit, OnDestroy {
  @ViewChild('timeSpecSelect', { static: false })
  timeSpecSelectElement: NgSelectComponent;

  @ViewChild('leftReportsContainer') leftReportsContainer!: ElementRef;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.timeSpecSelectElement?.close();
  }

  isInitialScrollCompleted = false;

  pageTitle = frontConstants.REPORTS_PAGE_TITLE;

  pathReports = common.PATH_REPORTS;
  pathReportsList = common.PATH_REPORTS_LIST;

  rowTypeFormula = common.RowTypeEnum.Formula;
  rowTypeMetric = common.RowTypeEnum.Metric;
  rowTypeHeader = common.RowTypeEnum.Header;
  rowTypeEmpty = common.RowTypeEnum.Empty;

  fractionTypeIsInRange = common.FractionTypeEnum.TsIsInRange;

  timeSpecYears = common.TimeSpecEnum.Years;
  timeSpecQuarters = common.TimeSpecEnum.Quarters;
  timeSpecMonths = common.TimeSpecEnum.Months;
  timeSpecWeeks = common.TimeSpecEnum.Weeks;
  timeSpecDays = common.TimeSpecEnum.Days;
  timeSpecHours = common.TimeSpecEnum.Hours;
  timeSpecMinutes = common.TimeSpecEnum.Minutes;
  timeSpecTimestamps = common.TimeSpecEnum.Timestamps;

  isShow = true;
  showSearch = true;

  isShowLeft = true;

  showMetrics = false;
  filtersIsExpanded = false;

  emptyReportId = common.EMPTY_REPORT_ID;

  notEmptySelectQueriesLength = 0;

  seriesParts: SeriesPart[] = [];
  dataPoints: DataPoint[] = [];

  refreshProgress = 0;
  refreshSubscription: Subscription;
  refreshId: string;

  showMiniCharts = true;
  showMiniCharts$ = this.uiQuery.showMiniCharts$.pipe(
    tap(x => {
      this.showMiniCharts = x;
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

  report: common.ReportX;
  report$ = this.reportQuery.select().pipe(
    tap(x => {
      this.report = x;

      this.isShow = true;

      this.notEmptySelectQueriesLength = this.report.rows.filter(
        row => common.isDefined(row.query) && row.mconfig.select.length > 0
      ).length;

      this.isAutoRun = this.uiQuery.getValue().isAutoRun;
      if (this.isAutoRun === true && this.report.reportId !== this.refreshId) {
        this.refreshForm.controls.refresh.setValue(0);
        this.refreshChange();
      }
      this.checkAutoRun();

      this.cd.detectChanges();

      if (
        x.draft === false &&
        this.report.reportId !== common.EMPTY_REPORT_ID
      ) {
        this.setProjectReportLink({ reportId: this.report.reportId });
      }
    })
  );

  refreshForm = this.fb.group({
    refresh: [undefined]
  });

  refreshList: RefreshItem[] = constants.REFRESH_LIST;

  searchMetricsWord: string;
  searchReportsWord: string;

  filteredDraftsLength: number;

  reports: common.ReportX[];
  reportsFilteredByWord: common.ReportX[];
  filteredReports: common.ReportX[];

  reports$ = this.reportsQuery.select().pipe(
    tap(x => {
      this.reports = x.reports;

      this.makeFilteredReports();

      this.cd.detectChanges();
      // this.scrollToSelectedReport();
    })
  );

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

  timeSpecForm = this.fb.group({
    timeSpec: [undefined]
  });

  timeSpecList: TimeSpecItem[] = [
    {
      label: 'Years',
      value: common.TimeSpecEnum.Years
    },
    {
      label: 'Quarters',
      value: common.TimeSpecEnum.Quarters
    },
    {
      label: 'Months',
      value: common.TimeSpecEnum.Months
    },
    {
      label: 'Weeks',
      value: common.TimeSpecEnum.Weeks
    },
    {
      label: 'Days',
      value: common.TimeSpecEnum.Days
    },
    {
      label: 'Hours',
      value: common.TimeSpecEnum.Hours
    },
    {
      label: 'Minutes',
      value: common.TimeSpecEnum.Minutes
    },
    {
      label: 'Timestamps',
      value: common.TimeSpecEnum.Timestamps
    }
  ];

  eChartInitOpts: any;
  eChartOptions: EChartsOption;

  isCompleted = false;
  lastCompletedQuery: common.Query;

  completedQueriesAndFormulasLength = 0;
  newQueriesLength = 0;
  runningQueriesLength = 0;
  recordsWithValuesLength = 0;
  selectedDataRowsLength = 0;

  reportChartData$ = combineLatest([
    this.uiQuery.repChartData$,
    this.uiQuery.showMetricsModelName$,
    this.uiQuery.showMetricsTimeFieldName$
    // ,
    // this.uiQuery.showMiniCharts$
  ]).pipe(
    tap(
      ([repChartData, showMetricsModelName, showMetricsTimeFieldName]: // ,
      // showMiniCharts
      [
        RepChartData,
        boolean,
        boolean
        // , boolean
      ]) => {
        // console.log(repChartData);

        let newQueriesLength = 0;
        let runningQueriesLength = 0;
        let completedQueriesAndFormulasLength = 0;

        repChartData.rows.forEach(row => {
          if (
            common.isDefined(row.formula) ||
            (common.isDefined(row.query) &&
              row.query.status === common.QueryStatusEnum.Completed)
          ) {
            completedQueriesAndFormulasLength++;
          }

          if (
            common.isDefined(row.query) &&
            row.query.status === common.QueryStatusEnum.New
          ) {
            newQueriesLength++;
          }

          if (
            common.isDefined(row.query) &&
            row.query.status === common.QueryStatusEnum.Running
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
              common.isDefined(r.query) &&
              r.query.status === common.QueryStatusEnum.Completed
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
          dataPoints = repChartData.columns
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

                if (row.showChart === true && common.isDefined(record?.value)) {
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
            [common.RowTypeEnum.Metric, common.RowTypeEnum.Formula].indexOf(
              row.rowType
            ) > -1
        ).length;

        // console.log('this.report.chart');
        // console.log(this.report.chart);

        // console.log('repChartData.rows');
        // console.log(repChartData.rows);

        this.eChartInitOpts = {
          renderer: 'svg'
          // renderer: 'canvas'
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
          // tooltip: {
          //   trigger: 'item'
          //   // , valueFormatter: (value: any) => `${common.isDefined(value) ? value.toFixed(2) : 'Null'}`
          // },
          tooltip: {
            confine: true,
            trigger: 'axis',
            order: 'valueDesc',
            valueFormatter: (value: any) =>
              `${common.isDefined(value) ? value.toFixed(2) : 'Null'}`
          },
          xAxis: {
            type: 'time',
            axisLabel:
              [
                common.TimeSpecEnum.Hours,
                common.TimeSpecEnum.Minutes,
                common.TimeSpecEnum.Timestamps
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
                  // console.log('chartSeriesElement');
                  // console.log(chartSeriesElement);

                  // console.log('repChartData.rows');
                  // console.log(repChartData.rows);

                  let seriesRow = repChartData.rows
                    .filter(
                      row =>
                        row.showChart === true &&
                        [
                          common.RowTypeEnum.Metric,
                          common.RowTypeEnum.Formula
                        ].indexOf(row.rowType) > -1
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
                    isMetric: seriesRow.rowType === common.RowTypeEnum.Metric,
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

        // console.log('dataPoints');
        // console.log(dataPoints);

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

  fractions: common.Fraction[] = [];
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

      if (common.isDefined(this.reportSelectedNode)) {
        if (
          this.reportSelectedNode.data.rowType === common.RowTypeEnum.Formula
        ) {
          setValueAndMark({
            control: this.formulaForm.controls['formula'],
            value: this.reportSelectedNode.data.formula
          });
        }

        if (
          this.reportSelectedNode.data.rowType !== common.RowTypeEnum.Empty &&
          this.reportSelectedNode.data.rowType !== common.RowTypeEnum.Metric
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

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private reportsQuery: ReportsQuery,
    private filteredReportsQuery: FilteredReportsQuery,
    private reportQuery: ReportQuery,
    private uiQuery: UiQuery,
    private memberQuery: MemberQuery,
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

    // this.searchWordChange();

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
              .filter(row => common.isDefined(row.query))
              .map(row => row.query.status)
              .indexOf(common.QueryStatusEnum.Running) > -1
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
    if (common.isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }

  getRepObservable() {
    let uiState = this.uiQuery.getValue();
    let nav = this.navQuery.getValue();

    let payload: apiToBackend.ToBackendGetReportRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      reportId: this.report.reportId,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetReport,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetReportResponse) => {
          if (
            resp.info?.status === common.ResponseInfoStatusEnum.Ok &&
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

    let payload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      mconfigIds: this.report.rows
        .filter(
          row => common.isDefined(row.query) && row.mconfig.select.length > 0
        )
        .map(row => row.mconfig.mconfigId)
      // queryIds: this.report.rows
      //   .filter(
      //     row => common.isDefined(row.query) && row.mconfig.select.length > 0
      //   )
      //   .map(row => row.query.queryId)
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
            if (
              runningQueries
                .map(y => y.queryId)
                .some(qId =>
                  this.report.rows
                    .filter(r => common.isDefined(r.query))
                    .map(r => r.query.queryId)
                    .includes(qId)
                )
            ) {
              let tReport = common.makeCopy(this.report);

              tReport.rows
                .filter(row => common.isDefined(row.query))
                .forEach(row => {
                  let runningQuery = runningQueries.find(
                    q => q.queryId === row.query.queryId
                  );

                  if (common.isDefined(runningQuery)) {
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
        // delay(1000),
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

  timeSpecChange(timeSpecValue?: common.TimeSpecEnum) {
    if (timeSpecValue === this.timeSpecForm.controls['timeSpec'].value) {
      return;
    }

    if (common.isDefined(timeSpecValue)) {
      this.timeSpecForm.controls['timeSpec'].setValue(timeSpecValue);
    }

    let timeSpec = this.timeSpecForm.controls['timeSpec'].value;

    let fraction = this.fractions[0];

    if (
      fraction.type === common.FractionTypeEnum.TsIsInLast &&
      timeSpec !== common.TimeSpecEnum.Timestamps
    ) {
      let newFraction = common.makeCopy(fraction);

      newFraction.tsLastUnit =
        timeSpec === common.TimeSpecEnum.Timestamps
          ? common.FractionTsUnitEnum.Minutes
          : timeSpec;

      newFraction = {
        brick:
          newFraction.tsLastCompleteOption ===
          common.FractionTsLastCompleteOptionEnum.Incomplete
            ? `last ${newFraction.tsLastValue} ${newFraction.tsLastUnit}`
            : newFraction.tsLastCompleteOption ===
                common.FractionTsLastCompleteOptionEnum.Complete
              ? `last ${newFraction.tsLastValue} ${newFraction.tsLastUnit} complete`
              : `last ${newFraction.tsLastValue} ${newFraction.tsLastUnit} complete plus current`,
        operator: common.FractionOperatorEnum.Or,
        type: common.FractionTypeEnum.TsIsInLast,
        tsLastValue: newFraction.tsLastValue,
        tsLastUnit: newFraction.tsLastUnit,
        tsLastCompleteOption: newFraction.tsLastCompleteOption
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
        timeRangeFractionBrick: uiState.timeRangeFraction.brick
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

  navToReport(report: common.ReportX) {
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

  deleteDraftReport(event: any, report: common.ReportX) {
    event.stopPropagation();
    this.reportService.deleteDraftReports({ reportIds: [report.reportId] });
  }

  reportSaveAs(event: any) {
    event.stopPropagation();

    this.myDialogService.showReportSaveAs({
      apiService: this.apiService,
      reports: this.reports.filter(
        x => x.draft === false && x.reportId !== common.EMPTY_REPORT_ID
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
      this.makeFilteredReports();

      this.cd.detectChanges();
      // this.scrollToSelectedReport();
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
    this.makeFilteredReports();

    this.cd.detectChanges();
    // this.scrollToSelectedReport();
  }

  makeFilteredReports() {
    let idxs;

    let draftReports = this.reports.filter(x => x.draft === true);
    let nonDraftReports = this.reports.filter(x => x.draft === false);

    if (common.isDefinedAndNotEmpty(this.searchReportsWord)) {
      let haystack = nonDraftReports.map(x =>
        common.isDefined(x.title) ? `${x.title}` : `${x.reportId}`
      );
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.searchReportsWord);
    }

    this.reportsFilteredByWord = common.isDefinedAndNotEmpty(
      this.searchReportsWord
    )
      ? idxs != null && idxs.length > 0
        ? idxs.map((idx: number): common.ReportX => nonDraftReports[idx])
        : []
      : nonDraftReports;

    this.filteredReports = [...draftReports, ...this.reportsFilteredByWord];

    this.filteredReports = this.filteredReports.sort((a, b) => {
      let aTitle = a.title || a.reportId;
      let bTitle = b.title || b.reportId;

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

  toggleAutoRun() {
    let newIsAutoRunValue = !this.isAutoRun;

    this.isAutoRun = newIsAutoRunValue;
    this.checkAutoRun();

    this.uiQuery.updatePart({ isAutoRun: newIsAutoRunValue });

    this.cd.detectChanges();
  }

  checkAutoRun() {
    // console.log('checkAutoRun');

    let newQueries = this.report.rows.filter(
      row =>
        common.isDefined(row.query) &&
        row.query.status === common.QueryStatusEnum.New
    );

    if (
      this.isAutoRun === true &&
      newQueries.length > 0 &&
      (this.report?.timeRangeFraction.type !==
        common.FractionTypeEnum.TsIsInRange ||
        this.report?.rangeOpen < this.report?.rangeClose)
    ) {
      setTimeout(() => {
        // console.log('checkAutoRun run');
        this.run();
      }, 0);
    }
  }

  checkRefreshSelector() {
    if (this.isAutoRun === false) {
      if (common.isDefined(this.refreshForm.controls.refresh.value)) {
        this.refreshForm.controls.refresh.setValue(undefined);
      }

      if (this.refreshForm.controls.refresh.enabled) {
        this.refreshForm.controls.refresh.disable();
      }

      this.refreshChange();
    } else if (this.isAutoRun === true) {
      if (common.isUndefined(this.refreshForm.controls.refresh.value)) {
        this.refreshForm.controls.refresh.setValue(0);
      }

      if (this.refreshForm.controls.refresh.disabled) {
        this.refreshForm.controls.refresh.enable();
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

    if (common.isUndefined(refreshValueSeconds) || refreshValueSeconds === 0) {
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
          // this.isRunButtonPressed === false &&
          this.notEmptySelectQueriesLength > 0 &&
          (this.report?.timeRangeFraction.type !==
            common.FractionTypeEnum.TsIsInRange ||
            this.report?.rangeOpen < this.report?.rangeClose)
        ) {
          this.run();
        }
      }
    });
  }

  toggleShowLeft() {
    this.isShowLeft = !this.isShowLeft;
  }

  toggleShowMiniCharts() {
    let newShowMiniChartsValue = !this.showMiniCharts;

    this.showMiniCharts = newShowMiniChartsValue;

    this.uiQuery.updatePart({ showMiniCharts: newShowMiniChartsValue });

    this.cd.detectChanges();
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;

    if (this.showSearch === false && common.isDefined(this.searchReportsWord)) {
      this.searchReportsWord = undefined;
      this.makeFilteredReports();
    }

    this.cd.detectChanges();
  }

  refreshShow() {
    // this.isShow = false;
    // setTimeout(() => {
    //   this.isShow = true;
    //   this.cd.detectChanges();
    // });
  }

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
          columns: []
        }
      });

      this.navigateService.navigateToReportsList();
    }
  }

  newReport() {
    this.setProjectReportLink({ reportId: common.EMPTY_REPORT_ID });

    this.navigateService.navigateToReport({
      reportId: common.EMPTY_REPORT_ID
    });
  }

  timezoneSearchFn(term: string, timezone: { value: string; label: string }) {
    let haystack = [`${timezone.label}`];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  setProjectReportLink(item: { reportId: string }) {
    let { reportId } = item;

    if (common.isUndefined(reportId)) {
      return;
    }

    let nav = this.navQuery.getValue();
    let links = this.uiQuery.getValue().projectReportLinks;

    let link: common.ProjectReportLink = links.find(
      l => l.projectId === nav.projectId
    );

    let newProjectReportLinks;

    if (common.isDefined(link)) {
      let newLink: common.ProjectReportLink = {
        projectId: nav.projectId,
        reportId: reportId,
        lastNavTs: Date.now()
      };

      newProjectReportLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === nav.projectId))
      ];
    } else {
      let newLink: common.ProjectReportLink = {
        projectId: nav.projectId,
        reportId: reportId,
        lastNavTs: Date.now()
      };

      newProjectReportLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectReportLinks = newProjectReportLinks.filter(
      l => l.lastNavTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({ projectReportLinks: newProjectReportLinks });
    this.uiService.setUserUi({ projectReportLinks: newProjectReportLinks });
  }

  scrollToSelectedReport(item: { isSmooth: boolean }) {
    let { isSmooth } = item;

    if (this.report && this.isShowLeft === true) {
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
    // console.log('reports ngOnDestroy');
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
        columns: []
      }
    });
  }
}

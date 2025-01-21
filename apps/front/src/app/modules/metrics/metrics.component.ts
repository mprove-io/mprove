import { Location } from '@angular/common';
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
import { ActivatedRoute, Router } from '@angular/router';
import { IRowNode } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  Subscription,
  combineLatest,
  concatMap,
  interval,
  of,
  take,
  tap
} from 'rxjs';
import { makeRepQueryParams } from '~front/app/functions/make-query-params';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { DataRow } from '~front/app/interfaces/data-row';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ReportQuery, emptyReport } from '~front/app/queries/report.query';
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
import { constants as frontConstants } from '~front/barrels/constants';

import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent } from '@ng-select/ng-select';
import { EChartsInitOpts, EChartsOption } from 'echarts';
import { DataPoint } from '~front/app/interfaces/data-point';
import { SeriesPart } from '~front/app/interfaces/series-part';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { DataService } from '~front/app/services/data.service';

export class TimeSpecItem {
  label: string;
  value: common.TimeSpecEnum;
}

@Component({
  selector: 'm-metrics',
  templateUrl: './metrics.component.html'
})
export class MetricsComponent implements OnInit, OnDestroy {
  @ViewChild('timeSpecSelect', { static: false })
  timeSpecSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.timeSpecSelectElement?.close();
  }

  pageTitle = frontConstants.METRICS_PAGE_TITLE;

  rowTypeFormula = common.RowTypeEnum.Formula;
  rowTypeMetric = common.RowTypeEnum.Metric;
  rowTypeHeader = common.RowTypeEnum.Header;
  rowTypeEmpty = common.RowTypeEnum.Empty;

  timeSpecYears = common.TimeSpecEnum.Years;
  timeSpecQuarters = common.TimeSpecEnum.Quarters;
  timeSpecMonths = common.TimeSpecEnum.Months;
  timeSpecWeeks = common.TimeSpecEnum.Weeks;
  timeSpecDays = common.TimeSpecEnum.Days;
  timeSpecHours = common.TimeSpecEnum.Hours;
  timeSpecMinutes = common.TimeSpecEnum.Minutes;
  timeSpecTimestamps = common.TimeSpecEnum.Timestamps;

  isAutoRun = true;

  isShow = true;

  isShowLeft = true;

  emptyReportId = common.EMPTY_REPORT_ID;

  filtersIsExpanded = false;

  queriesLength = 0;

  seriesParts: SeriesPart[] = [];
  dataPoints: DataPoint[] = [];

  reportGlobalRow: common.Row;

  report: common.ReportX;
  report$ = this.reportQuery.select().pipe(
    tap(x => {
      // console.log('x');
      // console.log(x);

      this.report = x;

      this.isShow = true;

      this.reportGlobalRow = this.report.rows.find(
        row => row.rowId === common.GLOBAL_ROW_ID
      );

      if (x.draft === false) {
        let links = this.uiQuery.getValue().projectReportLinks;

        let nav = this.navQuery.getValue();
        let link: common.ProjectReportLink = links.find(
          l => l.projectId === nav.projectId && l.draft === x.draft
        );

        let newProjectReportLinks;

        if (common.isDefined(link)) {
          let newLink = {
            projectId: nav.projectId,
            draft: x.draft,
            reportId: x.reportId,
            lastNavTs: Date.now()
          };

          newProjectReportLinks = [
            newLink,
            ...links.filter(
              r => !(r.projectId === nav.projectId && r.draft === x.draft)
            )
          ];
        } else {
          let newLink = {
            projectId: nav.projectId,
            draft: x.draft,
            reportId: x.reportId,
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

      this.queriesLength = this.report.rows.filter(row =>
        common.isDefined(row.query)
      ).length;

      let newQueries = this.report.rows.filter(
        row =>
          common.isDefined(row.query) &&
          row.query.status === common.QueryStatusEnum.New
      );

      if (this.isAutoRun === true && newQueries.length > 0) {
        setTimeout(() => {
          this.run();
        }, 0);
      }

      this.cd.detectChanges();
    })
  );

  draftsLength: number;

  reports: common.ReportX[];
  reports$ = this.reportsQuery.select().pipe(
    tap(x => {
      this.reports = [emptyReport, ...x.reports];
      this.draftsLength = this.reports.filter(y => y.draft === true).length;

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

  timezones = common.getTimezones();

  timeSpecForm = this.fb.group({
    timeSpec: [
      {
        value: undefined
      }
    ]
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
  ]).pipe(
    tap(
      ([repChartData, showMetricsModelName, showMetricsTimeFieldName]: [
        RepChartData,
        boolean,
        boolean
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

        this.eChartOptions = (<EChartsOption>{
          useUTC: true,
          grid: {
            left: '100',
            right: '50',
            top: '10%',
            bottom: '10%'
          },
          textStyle: {
            fontFamily: 'sans-serif'
          },
          legend: {
            textStyle: {
              fontSize: 14
            }
          },
          // tooltip: {
          //   trigger: 'item'
          //   // , valueFormatter: (value: any) => `${common.isDefined(value) ? value.toFixed(2) : 'Null'}`
          // },
          tooltip: {
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

                      return common.formatTsUnix({
                        timeSpec: timeSpec,
                        unixTimeZoned: value / 1000
                      });
                    }
                  }
          },
          yAxis: this.report.chart.yAxis.map(y => {
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
                    row: seriesRow,
                    chartSeriesElement: chartSeriesElement,
                    showMetricsModelName: showMetricsModelName,
                    showMetricsTimeFieldName: showMetricsTimeFieldName,
                    dataPoints: dataPoints
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
          chartFormulaData: {
            dataPoints: dataPoints,
            eChartInitOpts: this.eChartInitOpts,
            eChartOptions: this.eChartOptions,
            newQueriesLength: newQueriesLength,
            runningQueriesLength: runningQueriesLength
          }
        });

        this.cd.detectChanges();
      }
    )
  );

  fractions: common.Fraction[] = [];
  showBricksJson = false;
  showMetricsModelName = false;
  showMetricsTimeFieldName = false;
  showMetricsChart = false;
  showMetricsChartSettings = false;

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

      this.showBricksJson = x.showParametersJson && x.showMetricsParameters;

      this.showMetricsModelName = x.showMetricsModelName;
      this.showMetricsTimeFieldName = x.showMetricsTimeFieldName;
      this.showMetricsChart = x.showMetricsChart;
      this.showMetricsChartSettings = x.showMetricsChartSettings;
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

  struct$ = this.structQuery.select().pipe(
    tap(x => {
      if (x.allowTimezones === false) {
        this.timezoneForm.controls['timezone'].disable();
      } else {
        this.timezoneForm.controls['timezone'].enable();
      }
    })
  );

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private metricsQuery: MetricsQuery,
    private reportsQuery: ReportsQuery,
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

    let uiState = this.uiQuery.getValue();

    this.timezoneForm.controls['timezone'].setValue(uiState.timezone);
    this.timeSpecForm.controls['timeSpec'].setValue(uiState.timeSpec);
    this.fractions = [uiState.timeRangeFraction];

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
      queryIds: this.report.rows
        .filter(row => common.isDefined(row.query))
        .map(row => row.query.queryId)
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

    this.getRep();
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
          ? common.FractionTsLastUnitEnum.Minutes
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

    this.getRep();
  }

  fractionUpdate(event$: any) {
    this.uiQuery.updatePart({ timeRangeFraction: event$.fraction });
    this.getRep();
  }

  getRep() {
    let uiState = this.uiQuery.getValue();

    this.structRepResolver
      .resolveRoute({
        route: this.route.children[0].snapshot,
        showSpinner: false,
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
              queryParams: makeRepQueryParams({
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
    }

    this.uiQuery.getValue().gridApi.deselectAll();

    this.navigateService.navigateToMetricsRep({
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

  toggleAutoRun() {
    this.isAutoRun = !this.isAutoRun;
  }

  toggleShowLeft() {
    this.isShowLeft = !this.isShowLeft;
  }

  refreshShow() {
    // this.isShow = false;
    // setTimeout(() => {
    //   this.isShow = true;
    //   this.cd.detectChanges();
    // });
  }

  // toggleShowMetricsChart() {
  //   let showMetricsChart = !this.showMetricsChart;

  //   this.uiQuery.updatePart({
  //     showMetricsChart: showMetricsChart
  //   });

  //   this.uiService.setUserUi({
  //     showMetricsChart: showMetricsChart
  //   });
  // }

  toggleShowMetricsChartSettings() {
    let showMetricsChartSettings = !this.showMetricsChartSettings;

    this.uiQuery.updatePart({
      showMetricsChartSettings: showMetricsChartSettings
    });

    this.uiService.setUserUi({
      showMetricsChartSettings: showMetricsChartSettings
    });
  }

  timezoneSearchFn(term: string, timezone: { value: string; label: string }) {
    let haystack = [`${timezone.label}`];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  ngOnDestroy() {
    this.stopCheckRunning();
    this.metricsQuery.reset();
    this.reportsQuery.reset();
    this.reportQuery.reset();
    this.uiQuery.updatePart({
      reportSelectedNodes: [],
      gridApi: null,
      gridData: [],
      chartFormulaData: null,
      repChartData: {
        rows: [],
        columns: []
      }
    });
  }
}

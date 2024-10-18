import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AgAxisLabelFormatterParams,
  AgCartesianSeriesTooltipRendererParams,
  AgChartOptions,
  AgTooltipRendererResult
} from 'ag-charts-community';
import { IRowNode } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  combineLatest,
  concatMap,
  interval,
  of,
  Subscription,
  take,
  tap
} from 'rxjs';
import { makeRepQueryParams } from '~front/app/functions/make-query-params';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { emptyRep, RepQuery } from '~front/app/queries/rep.query';
import { RepsQuery } from '~front/app/queries/reps.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { RepChartData, UiQuery } from '~front/app/queries/ui.query';
import { StructRepResolver } from '~front/app/resolvers/struct-rep.resolver';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService } from '~front/app/services/query.service';
import { RepService } from '~front/app/services/rep.service';
import { UiService } from '~front/app/services/ui.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

import { constants as frontConstants } from '~front/barrels/constants';
import { DataRow } from './rep/rep.component';

export class TimeSpecItem {
  label: string;
  value: common.TimeSpecEnum;
}

@Component({
  selector: 'm-metrics',
  styleUrls: ['metrics.component.scss'],
  templateUrl: './metrics.component.html'
})
export class MetricsComponent implements OnInit, OnDestroy {
  pageTitle = frontConstants.METRICS_PAGE_TITLE;

  rowTypeFormula = common.RowTypeEnum.Formula;
  rowTypeMetric = common.RowTypeEnum.Metric;
  rowTypeHeader = common.RowTypeEnum.Header;
  rowTypeEmpty = common.RowTypeEnum.Empty;

  isAutoRun = true;

  isShow = true;

  isShowLeft = true;
  isShowTable = true;

  emptyRepId = common.EMPTY_REP_ID;

  queriesLength = 0;

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;

      console.log('rep', x);

      this.queriesLength = this.rep.rows.filter(row =>
        common.isDefined(row.query)
      ).length;

      let newQueries = this.rep.rows.filter(
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

  reps: common.RepX[];
  reps$ = this.repsQuery.select().pipe(
    tap(x => {
      this.reps = [emptyRep, ...x.reps];
      this.draftsLength = this.reps.filter(y => y.draft === true).length;

      this.cd.detectChanges();
    })
  );

  timezone: string;

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
    }
  ];

  timezones = common.getTimezones();

  chartOptions: AgChartOptions;

  recordsWithValuesLength = 0;
  selectedRowsWithQueriesLength = 0;

  repChartData$ = combineLatest([
    this.uiQuery.repChartData$,
    this.uiQuery.showMetricsModelName$,
    this.uiQuery.showMetricsTimeFieldName$
  ]).pipe(
    tap(
      ([x, showMetricsModelName, showMetricsTimeFieldName]: [
        RepChartData,
        boolean,
        boolean
      ]) => {
        let dataPoints: any[] = [];

        let recordsWithValuesLength = 0;

        if (x.rows.length > 0) {
          dataPoints = x.columns
            .filter(column => column.columnId !== 0)
            .map(column => {
              let dataPoint: any = {
                columnId: column.columnId,
                columnLabel: column.label
              };

              x.rows.forEach(row => {
                let rowName = this.makeRowName({
                  row: row,
                  showMetricsModelName: showMetricsModelName,
                  showMetricsTimeFieldName: showMetricsTimeFieldName
                });

                let record = row.records.find(
                  rec => rec.key === column.columnId
                );
                dataPoint[rowName] = record?.value;
                if (common.isDefined(record?.value)) {
                  recordsWithValuesLength++;
                }
              });

              return dataPoint;
            });
        }

        this.recordsWithValuesLength = recordsWithValuesLength;

        this.selectedRowsWithQueriesLength = x.rows.filter(
          row =>
            [common.RowTypeEnum.Metric, common.RowTypeEnum.Formula].indexOf(
              row.rowType
            ) > -1
        ).length;

        let series = x.rows
          .filter(
            row =>
              [common.RowTypeEnum.Metric, common.RowTypeEnum.Formula].indexOf(
                row.rowType
              ) > -1
          )
          .map(row => {
            let rowName = this.makeRowName({
              row: row,
              showMetricsModelName: showMetricsModelName,
              showMetricsTimeFieldName: showMetricsTimeFieldName
            });

            let srs = {
              type: 'line',
              xKey: 'columnId',
              yKey: rowName,
              yName: rowName,
              tooltip: {
                renderer: (params: AgCartesianSeriesTooltipRendererParams) => {
                  let timeSpec = this.uiQuery.getValue().timeSpec;

                  // console.log(params);

                  let columnLabel = common.formatTs({
                    timeSpec: timeSpec,
                    unixTime: Number(params.datum[params.xKey])
                  });

                  let formattedValue = common.isDefined(
                    params.datum[params.yKey]
                  )
                    ? this.queryService.formatValue({
                        value: Number(params.datum[params.yKey]),
                        formatNumber: row.formatNumber,
                        fieldResult: common.FieldResultEnum.Number,
                        currencyPrefix: row.currencyPrefix,
                        currencySuffix: row.currencySuffix
                      })
                    : 'undefined';

                  let result: AgTooltipRendererResult = {
                    title: params.title,
                    content: `${columnLabel}: ${formattedValue}`
                  };

                  return result;
                }
              }
            };

            return srs;
          });

        let structState = this.structQuery.getValue();

        this.chartOptions = {
          data: dataPoints,
          legend: {
            position: 'top'
          },
          series: series as any,
          axes: [
            {
              type: 'category',
              position: 'bottom',
              label: {
                formatter: (params: AgAxisLabelFormatterParams) => {
                  let timeSpec = this.uiQuery.getValue().timeSpec;

                  return common.formatTs({
                    timeSpec: timeSpec,
                    unixTime: params.value
                  });
                }
              }
            },
            {
              type: 'number',
              position: 'left',
              min: 0,
              label: {
                formatter: (params: AgAxisLabelFormatterParams) => {
                  let formattedValue = common.isDefined(params.value)
                    ? this.queryService.formatValue({
                        value: params.value,
                        formatNumber: structState.formatNumber,
                        fieldResult: common.FieldResultEnum.Number,
                        currencyPrefix: structState.currencyPrefix,
                        currencySuffix: structState.currencySuffix
                      })
                    : 'undefined';

                  return formattedValue;
                }
              }
            }
          ]
          // ,
          // navigator: {
          //   enabled: true
          // }
        };

        this.cd.detectChanges();
      }
    )
  );

  fractions: common.Fraction[] = [];
  showMetricsModelName = false;
  showMetricsTimeFieldName = false;
  showMetricsChart = false;
  showMetricsChartSettings = false;
  showChartForSelectedRows = false;

  repSelectedNodes: any[] = [];
  repSelectedNode: IRowNode<DataRow>;

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
      this.showMetricsChartSettings = x.showMetricsChartSettings;
      this.showChartForSelectedRows = x.showChartForSelectedRows;
      this.repSelectedNodes = x.repSelectedNodes;

      this.repSelectedNode =
        x.repSelectedNodes.length === 1 ? x.repSelectedNodes[0] : undefined;

      if (common.isDefined(this.repSelectedNode)) {
        if (this.repSelectedNode.data.rowType === common.RowTypeEnum.Formula) {
          setValueAndMark({
            control: this.formulaForm.controls['formula'],
            value: this.repSelectedNode.data.formula
          });
        }

        if (
          this.repSelectedNode.data.rowType !== common.RowTypeEnum.Empty &&
          this.repSelectedNode.data.rowType !== common.RowTypeEnum.Metric
        ) {
          setValueAndMark({
            control: this.nameForm.controls['name'],
            value: this.repSelectedNode.data.name
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

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private repsQuery: RepsQuery,
    private repQuery: RepQuery,
    private uiQuery: UiQuery,
    private memberQuery: MemberQuery,
    private structQuery: StructQuery,
    private location: Location,
    private router: Router,
    private navQuery: NavQuery,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private uiService: UiService,
    private repService: RepService,
    private queryService: QueryService,
    private navigateService: NavigateService,
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private structRepResolver: StructRepResolver,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let uiState = this.uiQuery.getValue();

    this.timezone = uiState.timezone;
    this.timeSpecForm.controls['timeSpec'].setValue(uiState.timeSpec);
    this.fractions = [uiState.timeRangeFraction];

    this.startCheckRunning();
  }

  startCheckRunning() {
    this.checkRunning$ = interval(2000)
      .pipe(
        concatMap(() => {
          if (
            this.rep?.rows
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

    let payload: apiToBackend.ToBackendGetRepRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      repId: this.rep.repId,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick
    };

    return this.apiService
      .req({
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRep,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetRepResponse) => {
          if (
            resp.info?.status === common.ResponseInfoStatusEnum.Ok &&
            this.rep.repId === resp.payload.rep.repId
          ) {
            this.memberQuery.update(resp.payload.userMember);

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.repQuery.update(resp.payload.rep);
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
      queryIds: this.rep.rows
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
                  this.rep.rows
                    .filter(r => common.isDefined(r.query))
                    .map(r => r.query.queryId)
                    .includes(qId)
                )
            ) {
              let tRep = common.makeCopy(this.rep);

              tRep.rows
                .filter(row => common.isDefined(row.query))
                .forEach(row => {
                  let runningQuery = runningQueries.find(
                    q => q.queryId === row.query.queryId
                  );

                  if (common.isDefined(runningQuery)) {
                    row.query = runningQuery;
                  }
                });

              this.repQuery.update(tRep);
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
    this.uiQuery.updatePart({ timezone: this.timezone });
    this.getRep();
  }

  timeSpecChange() {
    let timeSpec = this.timeSpecForm.controls['timeSpec'].value;

    let fraction = this.fractions[0];

    if (fraction.type === common.FractionTypeEnum.TsIsInLast) {
      let newFraction = common.makeCopy(fraction);

      newFraction.tsLastUnit = timeSpec;

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
        showSpinner: true,
        timezone: uiState.timezone,
        timeSpec: uiState.timeSpec,
        timeRangeFractionBrick: uiState.timeRangeFraction.brick
      })
      .pipe(
        tap(x => {
          let uiStateB = this.uiQuery.getValue();

          const url = this.router
            .createUrlTree([], {
              relativeTo: this.route,
              queryParams: makeRepQueryParams({
                timezone: uiStateB.timezone,
                timeSpec: uiStateB.timeSpec,
                timeRangeFraction: uiStateB.timeRangeFraction,
                selectRowsNodeIds: uiStateB.repSelectedNodes.map(
                  node => node.id
                )
              })
            })
            .toString();

          this.location.go(url);
        }),
        take(1)
      )
      .subscribe();
  }

  navToRep(rep: common.RepX) {
    this.uiQuery.getValue().gridApi.deselectAll();

    this.navigateService.navigateToMetricsRep({
      repId: rep.repId,
      selectRowsNodeIds: []
    });
  }

  deleteDrafts() {
    this.repService.deleteDraftReps({
      repIds: this.reps.filter(rep => rep.draft === true).map(rep => rep.repId)
    });
  }

  deleteDraftRep(event: any, rep: common.RepX) {
    event.stopPropagation();
    this.repService.deleteDraftReps({ repIds: [rep.repId] });
  }

  repSaveAs(event: any) {
    event.stopPropagation();

    this.myDialogService.showRepSaveAs({
      apiService: this.apiService,
      reps: this.reps.filter(
        x => x.draft === false && x.repId !== common.EMPTY_REP_ID
      ),
      rep: this.rep
    });
  }

  toggleAutoRun() {
    this.isAutoRun = !this.isAutoRun;
  }

  toggleShowLeft() {
    this.isShowLeft = !this.isShowLeft;
  }

  toggleShowTable() {
    this.isShowTable = !this.isShowTable;
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
      this.cd.detectChanges();
    });
  }

  toggleShowMetricsChart() {
    let showMetricsChart = !this.showMetricsChart;

    this.uiQuery.updatePart({
      showMetricsChart: showMetricsChart
    });

    this.uiService.setUserUi({
      showMetricsChart: showMetricsChart
    });
  }

  toggleShowMetricsChartSettings() {
    let showMetricsChartSettings = !this.showMetricsChartSettings;

    this.uiQuery.updatePart({
      showMetricsChartSettings: showMetricsChartSettings
    });

    this.uiService.setUserUi({
      showMetricsChartSettings: showMetricsChartSettings
    });
  }

  makeRowName(item: {
    row: DataRow;
    showMetricsModelName: boolean;
    showMetricsTimeFieldName: boolean;
  }) {
    let { row, showMetricsModelName, showMetricsTimeFieldName } = item;
    let { partLabel, topLabel, timeLabel } = item.row;

    let name;

    if (row.rowType !== common.RowTypeEnum.Metric) {
      name = row.name;
    } else {
      name = partLabel;

      if (showMetricsModelName === true) {
        name = `${topLabel} ${name}`;
      }

      if (showMetricsTimeFieldName === true) {
        name = `${name} by ${timeLabel}`;
      }
    }

    return `(${row.rowId}) ${name}`;
  }

  ngOnDestroy() {
    this.stopCheckRunning();
  }
}

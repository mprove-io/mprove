import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  AgAxisLabelFormatterParams,
  AgCartesianSeriesTooltipRendererParams,
  AgChartOptions,
  AgTooltipRendererResult
} from 'ag-charts-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { concatMap, interval, of, Subscription, take, tap } from 'rxjs';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { emptyRep, RepQuery } from '~front/app/queries/rep.query';
import { RepsQuery } from '~front/app/queries/reps.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
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

  isShow = true;

  emptyRepId = common.EMPTY_REP_ID;

  queriesLength = 0;

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;

      console.log(x);

      this.queriesLength = this.rep.rows.filter(row =>
        common.isDefined(row.query)
      ).length;

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

  timeSpecForm = this.fb.group({
    timeSpec: [
      {
        value: undefined
      }
    ]
  });

  timezoneForm = this.fb.group({
    timezone: [
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

  timezones = common
    .getTimezones()
    .filter(x => x.value !== common.USE_PROJECT_TIMEZONE_VALUE);

  chartOptions: AgChartOptions;

  recordsWithValuesLength = 0;

  repChartData$ = this.uiQuery.repChartData$.pipe(
    tap(x => {
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
              let record = row.records.find(rec => rec.key === column.columnId);
              dataPoint[row.metric] = record?.value;
              if (common.isDefined(record?.value)) {
                recordsWithValuesLength++;
              }
            });

            return dataPoint;
          });
      }

      this.recordsWithValuesLength = recordsWithValuesLength;

      let series = x.rows
        .filter(row => common.isDefined(row.metric))
        .map(row => ({
          type: 'line',
          xKey: 'columnId',
          yKey: row.metric,
          yName: row.metric,
          tooltip: {
            renderer: (params: AgCartesianSeriesTooltipRendererParams) => {
              let timeSpec = this.uiQuery.getValue().timeSpec;

              let columnLabel = common.formatTs({
                timeSpec: timeSpec,
                unixTime: params.xValue
              });

              let formattedValue = common.isDefined(params.yValue)
                ? this.queryService.formatValue({
                    value: params.yValue,
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
        }));

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
    })
  );

  fractions: common.Fraction[] = [];
  showMetricsChart = false;
  showMetricsChartSettings = false;
  showChartForSelectedRow = false;
  repSelectedNodes: any[] = [];

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.fractions = [x.timeRangeFraction];

      this.showMetricsChart = x.showMetricsChart;
      this.showMetricsChartSettings = x.showMetricsChartSettings;
      this.repSelectedNodes = x.repSelectedNodes;
      this.showChartForSelectedRow = x.showChartForSelectedRow;
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
      draft: this.rep.draft,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFraction: uiState.timeRangeFraction
    };

    return this.apiService
      .req({
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRep,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetRepResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
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

  navToRep(rep: common.RepX) {
    this.navigateService.navigateToMetricsRep({
      repId: rep.repId,
      draft: rep.draft,
      nodeIds: []
    });
  }

  timezoneChange() {
    let timezone = this.timezoneForm.controls['timezone'].value;
    this.uiQuery.updatePart({ timezone: timezone });
    this.structRepResolver
      .resolveRoute({
        route: this.route.children[0].snapshot,
        showSpinner: true
      })
      .pipe(take(1))
      .subscribe();
  }

  timeSpecChange() {
    let timeSpec = this.timeSpecForm.controls['timeSpec'].value;
    this.uiQuery.updatePart({ timeSpec: timeSpec });
    this.structRepResolver
      .resolveRoute({
        route: this.route.children[0].snapshot,
        showSpinner: true
      })
      .pipe(take(1))
      .subscribe();
  }

  fractionUpdate(event$: any) {
    this.uiQuery.updatePart({ timeRangeFraction: event$.fraction });

    this.structRepResolver
      .resolveRoute({
        route: this.route.children[0].snapshot,
        showSpinner: true
      })
      .pipe(take(1))
      .subscribe();
  }

  deleteRep(event: any, rep: common.RepX) {
    event.stopPropagation();
    this.repService.deleteRep({ repId: rep.repId });
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

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
      this.cd.detectChanges();
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

  ngOnDestroy() {
    this.stopCheckRunning();
  }
}

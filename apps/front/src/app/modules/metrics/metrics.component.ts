import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AgChartOptions } from 'ag-charts-community';
import { IRowNode } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { concatMap, interval, of, Subscription, take, tap } from 'rxjs';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { emptyRep, RepQuery } from '~front/app/queries/rep.query';
import { RepsQuery } from '~front/app/queries/reps.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { TimeQuery } from '~front/app/queries/time.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { StructRepResolver } from '~front/app/resolvers/struct-rep.resolver';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { RepService } from '~front/app/services/rep.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

import {
  constants,
  constants as frontConstants
} from '~front/barrels/constants';
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

  isShow = true;
  rowIsExpanded = false;
  chartIsExpanded = true;

  emptyRepId = common.EMPTY_REP_ID;

  queriesLength = 0;

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;
      this.queriesLength = this.rep.rows.filter(row =>
        common.isDefined(row.query)
      ).length;
      console.log(x);
      // console.log(x.timeRangeFraction);

      this.cd.detectChanges();
    })
  );

  fractions: common.Fraction[] = [];
  timeQuery$ = this.timeQuery.select().pipe(
    tap(x => {
      this.fractions = [x.timeRangeFraction];
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

  repSelectedNode: IRowNode<DataRow>;
  repSelectedNodes$ = this.uiQuery.repSelectedNodes$.pipe(
    tap(x => {
      this.repSelectedNode = x.length === 1 ? x[0] : undefined;
    })
  );

  chartOptions: AgChartOptions;

  repChartData$ = this.uiQuery.repChartData$.pipe(
    tap(x => {
      console.log(x);

      let data: any[] = [];
      if (x.length > 0) {
        let yKeys = x[0].records.map(record => record.key);

        data = yKeys
          .filter(yKey => yKey !== 0)
          .map(yKey => {
            let dataPoint: any = {
              period: yKey
            };

            x.forEach(row => {
              let record = row.records.find(rec => rec.key === yKey);

              dataPoint[row.metric] = record.value;
            });

            return dataPoint;
          });
      }

      let series = x.map(row => ({
        type: 'line',
        xKey: 'period',
        yKey: row.metric,
        yName: row.metric
      }));

      console.log(data);
      console.log(series);

      this.chartOptions = { data: data, series: series as any };

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
    private timeQuery: TimeQuery,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private repService: RepService,
    private navigateService: NavigateService,
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private structRepResolver: StructRepResolver,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let timeState = this.timeQuery.getValue();

    this.timezoneForm.controls['timezone'].setValue(timeState.timezone);
    this.timeSpecForm.controls['timeSpec'].setValue(timeState.timeSpec);
    this.fractions = [timeState.timeRangeFraction];

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
    let timeState = this.timeQuery.getValue();
    let nav = this.navQuery.getValue();

    let payload: apiToBackend.ToBackendGetRepRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      repId: this.rep.repId,
      draft: this.rep.draft,
      timezone: timeState.timezone,
      timeSpec: timeState.timeSpec,
      timeRangeFraction: timeState.timeRangeFraction
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
      draft: rep.draft
    });
  }

  timezoneChange() {
    let timezone = this.timezoneForm.controls['timezone'].value;
    localStorage.setItem(constants.LOCAL_STORAGE_TIMEZONE, timezone);
    this.timeQuery.updatePart({ timezone: timezone });
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
    localStorage.setItem(constants.LOCAL_STORAGE_TIME_SPEC, timeSpec);
    this.timeQuery.updatePart({ timeSpec: timeSpec });
    this.structRepResolver
      .resolveRoute({
        route: this.route.children[0].snapshot,
        showSpinner: true
      })
      .pipe(take(1))
      .subscribe();
  }

  fractionUpdate(event$: any) {
    localStorage.setItem(
      constants.LOCAL_STORAGE_TIME_RANGE_FRACTION,
      JSON.stringify(event$.fraction)
    );

    this.timeQuery.updatePart({ timeRangeFraction: event$.fraction });

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

  toggleRowPanel() {
    this.rowIsExpanded = !this.rowIsExpanded;
    this.refreshShow();
  }

  toggleChartPanel() {
    this.chartIsExpanded = !this.chartIsExpanded;
    this.refreshShow();
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.stopCheckRunning();
  }
}

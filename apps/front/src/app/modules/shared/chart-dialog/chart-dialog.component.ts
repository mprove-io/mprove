import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerService } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { Subscription, from, interval, of } from 'rxjs';
import { concatMap, delay, startWith, take, tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService, RData } from '~front/app/services/query.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { SharedModule } from '../shared.module';

export interface ChartDialogData {
  apiService: ApiService;
  mconfig: common.MconfigX;
  query: common.Query;
  qData: RData[];
  canAccessModel: boolean;
  showNav: boolean;
  isSelectValid: boolean;
  vizId: string;
  dashboardId: string;
  listen?: { [a: string]: string };
  updateQueryFn?: any;
}

@Component({
  selector: 'm-chart-dialog',
  templateUrl: './chart-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, UiSwitchModule, TippyDirective, SharedModule]
})
export class ChartDialogComponent implements OnInit, OnDestroy {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  chartDialogRunButtonSpinnerName = 'chartDialogRunButtonSpinnerName';

  isRunButtonPressed = false;

  chartTypeEnumTable = common.ChartTypeEnum.Table;

  isShow = true;
  isData = false;
  isFormat = true;
  showNav = false;

  checkRunning$: Subscription;

  canAccessModel: boolean;
  qData: RData[];
  query: common.Query;
  mconfig: common.MconfigX;
  isSelectValid = false;

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  runButtonTimerSubscription: Subscription;

  constructor(
    public ref: DialogRef<ChartDialogData>,
    private cd: ChangeDetectorRef,
    private queryService: QueryService,
    private memberQuery: MemberQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private navigateService: NavigateService
  ) {}

  ngOnInit() {
    this.qData = this.ref.data.qData;
    this.mconfig = this.ref.data.mconfig;
    this.query = this.ref.data.query;
    this.canAccessModel = this.ref.data.canAccessModel;
    this.showNav = this.ref.data.showNav;
    this.isSelectValid = this.ref.data.isSelectValid;

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

    // removes scroll for gauge chart
    this.refreshShow();

    this.checkRunning$ = interval(3000)
      .pipe(
        concatMap(() => {
          if (this.query?.status === common.QueryStatusEnum.Running) {
            let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
              projectId: nav.projectId,
              branchId: nav.branchId,
              envId: nav.envId,
              isRepoProd: nav.isRepoProd,
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId,
              vizId: this.ref.data.vizId,
              dashboardId: this.ref.data.dashboardId
            };

            return this.ref.data.apiService
              .req({
                pathInfoName:
                  apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                payload: payload
              })
              .pipe(
                tap((resp: apiToBackend.ToBackendGetQueryResponse) => {
                  if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
                    this.query = resp.payload.query;

                    this.qData =
                      this.mconfig.queryId === this.query.queryId
                        ? this.queryService.makeQData({
                            data: this.query.data,
                            columns: this.mconfig.fields
                          })
                        : [];

                    this.cd.detectChanges();

                    if (
                      common.isDefined(this.ref.data.updateQueryFn) &&
                      resp.payload.query.status !==
                        common.QueryStatusEnum.Running
                    ) {
                      this.ref.data.updateQueryFn(resp.payload.query);
                    }
                  }
                })
              );
          } else {
            return of(1);
          }
        })
      )
      .subscribe();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  toggleData() {
    this.isData = !this.isData;
    this.refreshShow();
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
    });
  }

  toggleFormat() {
    this.isFormat = !this.isFormat;
  }

  explore(event?: MouseEvent) {
    if (this.canAccessModel === false) {
      return;
    }

    this.ref.close();

    this.navigateService.navigateMconfigQuery({
      modelId: this.mconfig.modelId,
      mconfigId: this.mconfig.mconfigId,
      queryId: this.query.queryId
    });
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

    this.ref.data.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendRunQueriesResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let { runningQueries } = resp.payload;

            this.query = Object.assign(runningQueries[0], {
              sql: this.query.sql,
              data: this.query.data
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  goToModel(modelId: string, canAccessModel: boolean) {
    if (canAccessModel === false) {
      return;
    }

    this.ref.close();
    this.navigateService.navigateToModel(modelId);
  }

  startRunButtonTimer() {
    this.isRunButtonPressed = true;
    this.spinner.show(this.chartDialogRunButtonSpinnerName);
    this.cd.detectChanges();

    this.runButtonTimerSubscription = from([0])
      .pipe(
        concatMap(v => of(v).pipe(delay(1000))),
        startWith(1),
        tap(x => {
          if (x === 0) {
            this.spinner.hide(this.chartDialogRunButtonSpinnerName);
            this.isRunButtonPressed = false;
            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyChartDialog');
    this.runButtonTimerSubscription?.unsubscribe();

    if (common.isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }
}

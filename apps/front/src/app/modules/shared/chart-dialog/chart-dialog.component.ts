import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { interval, of, Subscription } from 'rxjs';
import { map, startWith, switchMap, take, tap } from 'rxjs/operators';
import { getExtendedFilters } from '~front/app/functions/get-extended-filters';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService, RData } from '~front/app/services/query.service';
import { ModelStore } from '~front/app/stores/model.store';
import { MqStore } from '~front/app/stores/mq.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-dialog',
  templateUrl: './chart-dialog.component.html'
})
export class ChartDialogComponent implements OnInit, OnDestroy {
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
  model: common.Model;
  extendedFilters: common.FilterX[];
  isSelectValid = false;

  constructor(
    public ref: DialogRef,
    private cd: ChangeDetectorRef,
    private queryService: QueryService,
    private navigateService: NavigateService,
    private mqStore: MqStore,
    private modelStore: ModelStore
  ) {}

  ngOnInit() {
    this.qData = this.ref.data.qData;
    this.mconfig = this.ref.data.mconfig;
    this.query = this.ref.data.query;
    this.model = this.ref.data.model;
    this.canAccessModel = this.ref.data.canAccessModel;
    this.showNav = this.ref.data.showNav;
    this.isSelectValid = this.ref.data.isSelectValid;

    this.extendedFilters = getExtendedFilters({
      fields: this.model.fields,
      mconfig: this.mconfig
    });

    // removes scroll for gauge chart
    this.refreshShow();

    this.checkRunning$ = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (this.query?.status === common.QueryStatusEnum.Running) {
            let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId,
              vizId: this.ref.data.vizId,
              dashboardId: this.ref.data.dashboardId
            };

            return this.ref.data.apiService
              .req(
                apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                payload
              )
              .pipe(
                tap((resp: apiToBackend.ToBackendGetQueryResponse) => {
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
                    resp.payload.query.status !== common.QueryStatusEnum.Running
                  ) {
                    this.ref.data.updateQueryFn(resp.payload.query);
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

    this.modelStore.update(this.model);

    this.mqStore.update(state =>
      Object.assign({}, state, { mconfig: this.mconfig, query: this.query })
    );

    this.navigateService.navigateMconfigQuery({
      modelId: this.model.modelId,
      mconfigId: this.mconfig.mconfigId,
      queryId: this.query.queryId
    });
  }

  run() {
    let payload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      queryIds: [this.query.queryId]
    };

    this.ref.data.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendRunQueriesResponse) => {
          let { runningQueries } = resp.payload;

          this.query = runningQueries[0];
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

  ngOnDestroy() {
    // console.log('ngOnDestroyChartDialog');
    if (common.isDefined(this.checkRunning$)) {
      this.checkRunning$?.unsubscribe();
    }
  }
}

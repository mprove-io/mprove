import { Injectable } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { ModelQuery } from '../queries/model.query';
import { NavQuery } from '../queries/nav.query';
import { MqState, MqStore } from '../stores/mq.store';
import { NavState } from '../stores/nav.store';
import { StructStore } from '../stores/struct.store';
import { ApiService } from './api.service';
import { NavigateService } from './navigate.service';

@Injectable({ providedIn: 'root' })
export class MconfigService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  constructor(
    public modelQuery: ModelQuery,
    private apiService: ApiService,
    private mqStore: MqStore,
    public navQuery: NavQuery,
    public structStore: StructStore,
    private navigateService: NavigateService
  ) {
    this.nav$.subscribe();
  }

  removeField(item: { newMconfig: common.MconfigX; fieldId: string }) {
    let { newMconfig, fieldId } = item;

    newMconfig = this.removeFieldFromSelect({ newMconfig, fieldId });
    newMconfig = this.removeFieldFromSortings({ newMconfig, fieldId });
    newMconfig = this.removeFieldFromChart({ newMconfig, fieldId });

    return newMconfig;
  }

  private removeFieldFromSelect(item: {
    newMconfig: common.MconfigX;
    fieldId: string;
  }) {
    let { newMconfig, fieldId } = item;

    let fieldIndex = newMconfig.select.findIndex(x => x === fieldId);

    newMconfig.select = [
      ...newMconfig.select.slice(0, fieldIndex),
      ...newMconfig.select.slice(fieldIndex + 1)
    ];

    return newMconfig;
  }

  private removeFieldFromSortings(item: {
    newMconfig: common.MconfigX;
    fieldId: string;
  }) {
    let { newMconfig, fieldId } = item;

    let fIndex = newMconfig.sortings.findIndex(x => x.fieldId === fieldId);

    if (fIndex > -1) {
      newMconfig.sortings = [
        ...newMconfig.sortings.slice(0, fIndex),
        ...newMconfig.sortings.slice(fIndex + 1)
      ];

      let newSorts: string[] = [];

      newMconfig.sortings.forEach(sorting =>
        sorting.desc === true
          ? newSorts.push(`${sorting.fieldId} desc`)
          : newSorts.push(sorting.fieldId)
      );

      newMconfig.sorts =
        newMconfig.sortings.length > 0 ? newSorts.join(', ') : null;
    }

    return newMconfig;
  }

  removeFieldFromChart(item: { newMconfig: common.MconfigX; fieldId: string }) {
    let { newMconfig, fieldId } = item;

    if (newMconfig.chart.xField === fieldId) {
      newMconfig.chart.xField = null;
    }

    if (newMconfig.chart.yField === fieldId) {
      newMconfig.chart.yField = null;
    }

    if (newMconfig.chart.multiField === fieldId) {
      newMconfig.chart.multiField = null;
    }

    if (newMconfig.chart.valueField === fieldId) {
      newMconfig.chart.valueField = null;
    }

    if (newMconfig.chart.previousValueField === fieldId) {
      newMconfig.chart.previousValueField = null;
    }

    if (newMconfig.chart.yFields.length > 0) {
      let index = newMconfig.chart.yFields.findIndex(yId => yId === fieldId);

      if (index > -1) {
        newMconfig.chart.yFields = [
          ...newMconfig.chart.yFields.slice(0, index),
          ...newMconfig.chart.yFields.slice(index + 1)
        ];
      }
    }

    if (newMconfig.chart.hideColumns.length > 0) {
      let index = newMconfig.chart.hideColumns.findIndex(
        hId => hId === fieldId
      );

      if (index > -1) {
        newMconfig.chart.hideColumns = [
          ...newMconfig.chart.hideColumns.slice(0, index),
          ...newMconfig.chart.hideColumns.slice(index + 1)
        ];
      }
    }

    return newMconfig;
  }

  navCreateMconfigAndQuery(newMconfig: common.MconfigX) {
    let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      mconfig: newMconfig
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendCreateTempMconfigAndQuery,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateTempMconfigAndQueryResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let { mconfig, query } = resp.payload;

            this.mqStore.update({ mconfig: mconfig, query: query });

            this.navigateService.navigateMconfigQuery({
              mconfigId: mconfig.mconfigId,
              queryId: mconfig.queryId
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  optimisticNavCreateMconfigAndQuery(item: {
    newMconfig: common.MconfigX;
    queryId: string;
  }) {
    let { newMconfig, queryId } = item;

    let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      mconfig: newMconfig
    };

    let optMconfig = common.makeCopy(newMconfig);

    optMconfig.queryId = queryId;

    this.mqStore.update((state: MqState) =>
      Object.assign({}, state, {
        mconfig: optMconfig,
        query: state.query
      })
    );

    this.navigateService.navigateMconfigQuery({
      mconfigId: optMconfig.mconfigId,
      queryId: queryId
    });

    // is required to check that structId is still valid
    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendCreateTempMconfigAndQuery,
        payload,
        true
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendCreateTempMconfigAndQueryResponse) => {}
        ),
        take(1)
      )
      .subscribe();
  }
}

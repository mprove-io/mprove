import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { ModelQuery } from '../queries/model.query';
import { MqQuery } from '../queries/mq.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { StructQuery } from '../queries/struct.query';
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
    private modelQuery: ModelQuery,
    private apiService: ApiService,
    private mqQuery: MqQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
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

  navCreateTempMconfigAndQuery(newMconfig: common.MconfigX) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryRequestPayload =
      {
        projectId: this.nav.projectId,
        isRepoProd: this.nav.isRepoProd,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        mconfig: newMconfig
      };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendCreateTempMconfigAndQuery,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateTempMconfigAndQueryResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let { mconfig, query } = resp.payload;

            this.mqQuery.update({ mconfig: mconfig, query: query });

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

  optimisticNavCreateTempMconfig(item: { newMconfig: common.MconfigX }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { newMconfig } = item;

    newMconfig.queryId = this.mqQuery.getValue().query.queryId;

    let payload: apiToBackend.ToBackendCreateTempMconfigRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      oldMconfigId: this.mqQuery.getValue().mconfig.mconfigId,
      mconfig: newMconfig
    };

    this.mqQuery.updatePart({
      mconfig: newMconfig
    });

    this.navigateService.navigateMconfigQuery({
      mconfigId: newMconfig.mconfigId,
      queryId: newMconfig.queryId
    });

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempMconfig,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendCreateTempMconfigResponse) => {}),
        take(1)
      )
      .subscribe();
  }

  navDuplicateMconfigAndQuery(item: { oldMconfigId: string }) {
    let { oldMconfigId } = item;

    this.spinner.show(constants.APP_SPINNER_NAME);

    let payload: apiToBackend.ToBackendDuplicateMconfigAndQueryRequestPayload =
      {
        projectId: this.nav.projectId,
        isRepoProd: this.nav.isRepoProd,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        oldMconfigId: oldMconfigId
      };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendDuplicateMconfigAndQuery,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDuplicateMconfigAndQueryResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let { mconfig, query } = resp.payload;

            this.navigateService.navigateMconfigQuery({
              mconfigId: mconfig.mconfigId,
              queryId: mconfig.queryId,
              modelId: mconfig.modelId
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }
}

import { Injectable } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { ModelQuery } from '../queries/model.query';
import { MconfigStore } from '../stores/mconfig.store';
import { QueryStore } from '../stores/query.store';
import { StructStore } from '../stores/struct.store';
import { ApiService } from './api.service';
import { NavigateService } from './navigate.service';

@Injectable({ providedIn: 'root' })
export class MconfigService {
  constructor(
    public modelQuery: ModelQuery,
    private apiService: ApiService,
    private mconfigStore: MconfigStore,
    private queryStore: QueryStore,
    public structStore: StructStore,
    private navigateService: NavigateService
  ) {}

  removeField(item: { newMconfig: common.Mconfig; fieldId: string }) {
    let { newMconfig, fieldId } = item;

    newMconfig = this.removeFieldFromSelect({ newMconfig, fieldId });
    newMconfig = this.removeFieldFromSortings({ newMconfig, fieldId });

    // newMconfig.charts = newMconfig.charts.map(chart =>
    //   this.removeFieldFromChart(chart, fieldId)
    // );

    return newMconfig;
  }

  private removeFieldFromSelect(item: {
    newMconfig: common.Mconfig;
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
    newMconfig: common.Mconfig;
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

  navCreateMconfigAndQuery(newMconfig: common.Mconfig) {
    let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryRequestPayload = {
      mconfig: newMconfig
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendCreateTempMconfigAndQuery,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendCreateTempMconfigAndQueryResponse) => {
          let { mconfig, query } = resp.payload;

          this.mconfigStore.update(mconfig);
          this.queryStore.update(query);

          this.navigateService.navigateMconfigQueryData({
            mconfigId: mconfig.mconfigId,
            queryId: mconfig.queryId
          });
        }),
        take(1)
      )
      .subscribe();
  }
}

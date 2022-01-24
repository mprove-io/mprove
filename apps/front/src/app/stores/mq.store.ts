import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class MqState {
  query: common.Query;
  mconfig: common.MconfigX;
}

export const emptyMconfig: common.MconfigX = {
  structId: undefined,
  mconfigId: common.EMPTY,
  queryId: undefined,
  modelId: undefined,
  modelLabel: undefined,
  select: [],
  sortings: [],
  sorts: undefined,
  timezone: undefined,
  limit: undefined,
  listen: undefined,
  filters: [],
  extendedFilters: [],
  fields: [],
  chart: undefined,
  temp: true,
  serverTs: 1
};

export const emptyQuery: common.Query = {
  projectId: undefined,
  connectionId: undefined,
  connectionType: undefined,
  queryId: common.EMPTY,
  sql: undefined,
  status: common.QueryStatusEnum.New,
  data: [],
  lastRunBy: undefined,
  lastRunTs: 1,
  lastCancelTs: 1,
  lastCompleteTs: 1,
  lastCompleteDuration: undefined,
  lastErrorMessage: undefined,
  lastErrorTs: 1,
  postgresQueryJobId: undefined,
  bigqueryQueryJobId: undefined,
  bigqueryConsecutiveErrorsGetJob: undefined,
  bigqueryConsecutiveErrorsGetResults: undefined,
  serverTs: 1
};

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'mq',
  resettable: true
})
export class MqStore extends Store<MqState> {
  constructor() {
    super(<MqState>{
      mconfig: emptyMconfig,
      query: emptyQuery
    });
  }
}

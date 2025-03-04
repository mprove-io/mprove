import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class MqState {
  query: common.Query;
  mconfig: common.MconfigX;
}

export const emptyMconfig: common.MconfigX = {
  structId: undefined,
  mconfigId: common.EMPTY_MCONFIG_ID,
  queryId: undefined,
  modelId: undefined,
  isStoreModel: undefined,
  dateRangeIncludesRightSide: undefined,
  storePart: undefined,
  modelLabel: undefined,
  select: [],
  unsafeSelect: [],
  warnSelect: [],
  joinAggregations: [],
  sortings: [],
  sorts: undefined,
  timezone: undefined,
  limit: undefined,
  filters: [],
  extendedFilters: [],
  fields: [],
  chart: undefined,
  temp: true,
  serverTs: 1
};

export const emptyQuery: common.Query = {
  projectId: undefined,
  envId: undefined,
  connectionId: undefined,
  connectionType: undefined,
  storeModelId: undefined,
  storeStructId: undefined,
  queryId: common.EMPTY_QUERY_ID,
  sql: undefined,
  apiMethod: undefined,
  apiUrl: undefined,
  apiBody: undefined,
  status: common.QueryStatusEnum.New,
  data: [],
  lastRunBy: undefined,
  lastRunTs: 1,
  lastCancelTs: 1,
  lastCompleteTs: 1,
  lastCompleteDuration: undefined,
  lastErrorMessage: undefined,
  lastErrorTs: 1,
  queryJobId: undefined,
  bigqueryQueryJobId: undefined,
  bigqueryConsecutiveErrorsGetJob: undefined,
  bigqueryConsecutiveErrorsGetResults: undefined,
  serverTs: 1
};

let mqState: MqState = {
  mconfig: emptyMconfig,
  query: emptyQuery
};

@Injectable({ providedIn: 'root' })
export class MqQuery extends BaseQuery<MqState> {
  query$ = this.store.pipe(select(state => state.query));
  mconfig$ = this.store.pipe(select(state => state.mconfig));

  constructor() {
    super(createStore({ name: 'mq' }, withProps<MqState>(mqState)));
  }
}

import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class ChartState extends common.ChartX {}

export const emptyMconfig: common.MconfigX = {
  structId: undefined,
  mconfigId: common.EMPTY_MCONFIG_ID,
  queryId: undefined,
  modelId: undefined,
  modelType: undefined,
  // isStoreModel: undefined,
  dateRangeIncludesRightSide: undefined,
  storePart: undefined,
  modelLabel: undefined,
  modelFilePath: undefined,
  malloyQuery: undefined,
  compiledQuery: undefined,
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

let emptyTile: common.TileX = {
  modelId: undefined,
  modelLabel: undefined,
  modelFilePath: undefined,
  mconfigId: emptyMconfig.mconfigId,
  queryId: emptyQuery.queryId,
  // malloyQueryId: undefined,
  listen: undefined,
  deletedFilterFieldIds: undefined,
  title: 'New Chart',
  plateWidth: undefined,
  plateHeight: undefined,
  plateX: undefined,
  plateY: undefined,
  //
  mconfig: emptyMconfig,
  query: emptyQuery,
  hasAccessToModel: true
};

export const emptyChart: ChartState = {
  structId: undefined,
  chartId: common.EMPTY_CHART_ID,
  draft: false,
  creatorId: undefined,
  title: emptyTile.title,
  chartType: common.ChartTypeEnum.Table,
  modelId: undefined,
  modelLabel: undefined,
  filePath: undefined,
  accessRoles: [],
  hidden: undefined,
  serverTs: undefined,
  //
  tiles: [emptyTile],
  author: undefined,
  canEditOrDeleteChart: undefined
};

@Injectable({ providedIn: 'root' })
export class ChartQuery extends BaseQuery<ChartState> {
  constructor() {
    super(createStore({ name: 'chart' }, withProps<ChartState>(emptyChart)));
  }
}

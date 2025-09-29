import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import {
  EMPTY_CHART_ID,
  EMPTY_MCONFIG_ID,
  EMPTY_QUERY_ID
} from '~common/constants/top';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { ChartX } from '~common/interfaces/backend/chart-x';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { TileX } from '~common/interfaces/backend/tile-x';
import { Query } from '~common/interfaces/blockml/query';
import { BaseQuery } from './base.query';

export class ChartState extends ChartX {}

export const emptyMconfig: MconfigX = {
  structId: undefined,
  mconfigId: EMPTY_MCONFIG_ID,
  queryId: undefined,
  modelId: undefined,
  modelType: undefined,
  // isStoreModel: undefined,
  dateRangeIncludesRightSide: undefined,
  storePart: undefined,
  modelLabel: undefined,
  modelFilePath: undefined,
  malloyQueryStable: undefined,
  malloyQueryExtra: undefined,
  compiledQuery: undefined,
  select: [],
  // unsafeSelect: [],
  // warnSelect: [],
  // joinAggregations: [],
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

export const emptyQuery: Query = {
  projectId: undefined,
  envId: undefined,
  connectionId: undefined,
  connectionType: undefined,
  queryId: EMPTY_QUERY_ID,
  sql: undefined,
  apiMethod: undefined,
  apiUrl: undefined,
  apiBody: undefined,
  status: QueryStatusEnum.New,
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

let emptyTile: TileX = {
  modelId: undefined,
  modelLabel: undefined,
  modelFilePath: undefined,
  mconfigId: emptyMconfig.mconfigId,
  queryId: emptyQuery.queryId,
  trackChangeId: emptyMconfig.mconfigId,
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
  chartId: EMPTY_CHART_ID,
  draft: false,
  creatorId: undefined,
  title: emptyTile.title,
  chartType: ChartTypeEnum.Table,
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

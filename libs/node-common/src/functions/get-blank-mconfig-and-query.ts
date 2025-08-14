import { common } from '~node-common/barrels/common';
import { makeQueryId } from './make-query-id';

export function getBlankMconfigAndQuery(item: {
  projectId: string;
  envId: string;
  structId: string;
  model: common.Model;
  mconfig: common.Mconfig;
  connection: common.ProjectConnection;
}) {
  let { projectId, envId, structId, model, mconfig, connection } = item;

  let queryId = makeQueryId({
    projectId: projectId,
    envId: envId,
    connectionId: model.connectionId,
    sql: '',
    store: undefined,
    storeTransformedRequestString: undefined
  });

  let blankQuery: common.Query = {
    queryId: queryId,
    projectId: projectId,
    envId: envId,
    connectionId: model.connectionId,
    connectionType: connection.type,
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

  let blankMconfig: common.Mconfig = {
    structId: structId,
    mconfigId: common.makeId(),
    queryId: queryId,
    modelId: model.modelId,
    modelType: model.type,
    dateRangeIncludesRightSide: false,
    storePart: undefined,
    modelLabel: model.label,
    modelFilePath: model.filePath,
    malloyQuery: undefined,
    compiledQuery: undefined,
    select: [],
    unsafeSelect: [],
    warnSelect: [],
    joinAggregations: [],
    sortings: [],
    sorts: null,
    timezone: mconfig.timezone,
    limit: 500,
    filters: [],
    chart: common.makeCopy(common.DEFAULT_CHART),
    temp: false,
    serverTs: 1
  };

  return { blankMconfig: blankMconfig, blankQuery: blankQuery };
}

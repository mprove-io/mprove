import { DEFAULT_CHART } from '~common/constants/mconfig-chart';
import { MconfigParentTypeEnum } from '~common/enums/mconfig-parent-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Model } from '~common/interfaces/blockml/model';
import { Query } from '~common/interfaces/blockml/query';
import { makeQueryId } from './make-query-id';

export function getBlankMconfigAndQuery(item: {
  projectId: string;
  envId: string;
  structId: string;
  model: Model;
  mconfig: Mconfig;
}) {
  let { projectId, envId, structId, model, mconfig } = item;

  let queryId = makeQueryId({
    projectId: projectId,
    envId: envId,
    connectionId: model.connectionId,
    mconfigParentType: MconfigParentTypeEnum.Blank,
    mconfigParentId: undefined,
    sql: '',
    store: undefined,
    storeTransformedRequestString: undefined
  });

  let blankQuery: Query = {
    queryId: queryId,
    projectId: projectId,
    envId: envId,
    connectionId: model.connectionId,
    connectionType: model.connectionType,
    reportId: undefined,
    reportStructId: undefined,
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

  let blankMconfig: Mconfig = {
    structId: structId,
    mconfigId: makeId(),
    queryId: queryId,
    modelId: model.modelId,
    modelType: model.type,
    parentType: MconfigParentTypeEnum.Blank,
    parentId: undefined,
    dateRangeIncludesRightSide: false,
    storePart: undefined,
    modelLabel: model.label,
    modelFilePath: model.filePath,
    malloyQueryStable: undefined,
    malloyQueryExtra: undefined,
    compiledQuery: undefined,
    select: [],
    sortings: [],
    sorts: null,
    timezone: mconfig.timezone,
    limit: 500,
    filters: [],
    chart: makeCopy(DEFAULT_CHART),
    serverTs: 1
  };

  return { blankMconfig: blankMconfig, blankQuery: blankQuery };
}

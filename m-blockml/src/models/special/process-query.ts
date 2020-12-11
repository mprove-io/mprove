import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { genSql } from './gen-sql';

export async function processQuery(item: {
  projectId: string;
  structId: string;
  weekStart: api.ProjectWeekStartEnum;
  udfsDict: api.UdfsDict;
  mconfig: api.Mconfig;
  modelContent: string;
}) {
  let {
    projectId,
    structId,
    weekStart,
    udfsDict,
    mconfig,
    modelContent
  } = item;

  let { select, sorts, timezone, limit, filters } = mconfig;

  let newFilters: { [s: string]: string[] } = {};

  filters.forEach(f => {
    let fieldId = f.fieldId;
    let bricks = f.fractions.map(fraction => fraction.brick);

    newFilters[fieldId] = bricks;
  });

  let { sql, filtersFractions } = await genSql({
    model: JSON.parse(modelContent),
    select: select,
    sorts: sorts,
    timezone: timezone,
    limit: limit.toString(),
    filters: newFilters,
    weekStart: weekStart,
    projectId: projectId,
    udfsDict: udfsDict,
    structId: structId,
    errors: [],
    caller: enums.CallerEnum.ProcessQuery
  });

  mconfig.filters = Object.keys(filtersFractions).map(fieldId => ({
    fieldId: fieldId,
    fractions: filtersFractions[fieldId]
  }));

  let query: api.Query = {
    queryId: mconfig.queryId,
    projectId: projectId,
    structId: structId,
    sql: sql,
    status: api.QueryStatusEnum.New,
    lastRunBy: undefined,
    lastRunTs: 1,
    lastCancelTs: 1,
    lastCompleteTs: 1,
    lastCompleteDuration: undefined,
    lastErrorMessage: undefined,
    lastErrorTs: 1,
    data: undefined,
    temp: true,
    serverTs: 1
  };

  let payload: api.ToBlockmlProcessQueryResponsePayload = {
    mconfig: mconfig,
    query: query
  };

  return payload;
}

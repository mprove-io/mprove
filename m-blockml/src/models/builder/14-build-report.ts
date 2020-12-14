import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barReport } from '../../barrels/bar-report';
import { types } from '../../barrels/types';

export async function buildReport<T extends types.vdType>(item: {
  entities: Array<T>;
  models: interfaces.Model[];
  udfsDict: api.UdfsDict;
  projectId: string;
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let entities = item.entities;

  entities = barReport.checkReportIsObject({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkReportUnknownParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkReportTitleModelSelect({
    entities: entities,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkSelectElements({
    entities: entities,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkSelectForceDims({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkSorts({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkTimezone({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkLimit({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkListenFilters({
    entities: entities,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkDefaultFilters({
    entities: entities,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.combineReportFilters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkFiltersForceDims({
    entities: entities,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barReport.checkSqlAlwaysWhereCalcForceDims({
    entities: entities,
    models: item.models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = await barReport.fetchSql({
    entities: entities,
    models: item.models,
    udfsDict: item.udfsDict,
    weekStart: item.weekStart,
    projectId: item.projectId,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return entities;
}

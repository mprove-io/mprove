import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barReport } from '../../barrels/bar-report';
import { types } from '../../barrels/types';
import { RabbitService } from '../../services/rabbit.service';

export async function buildReport<T extends types.dzType>(item: {
  traceId: string;
  rabbitService: RabbitService;
  entities: Array<T>;
  models: interfaces.Model[];
  udfsDict: api.UdfsDict;
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
    traceId: item.traceId,
    rabbitService: item.rabbitService,
    entities: entities,
    models: item.models,
    udfsDict: item.udfsDict,
    weekStart: item.weekStart,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return entities;
}

import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { barReport } from '~/barrels/bar-report';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { types } from '~/barrels/types';
import { BmError } from '~/models/bm-error';
import { RabbitService } from '~/services/rabbit.service';

export async function buildReport<T extends types.dzType>(
  item: {
    traceId: string;
    entities: Array<T>;
    models: interfaces.Model[];
    udfsDict: api.UdfsDict;
    weekStart: api.ProjectWeekStartEnum;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>,
  rabbitService: RabbitService
) {
  let entities = item.entities;

  entities = barReport.checkReportIsObject(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barReport.checkReportUnknownParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barReport.checkReportTitleModelSelect(
    {
      entities: entities,
      models: item.models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barReport.checkSelectElements(
    {
      entities: entities,
      models: item.models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barReport.checkSorts(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barReport.checkTimezone(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barReport.checkLimit(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barReport.checkListenFilters(
    {
      entities: entities,
      models: item.models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barReport.checkDefaultFilters(
    {
      entities: entities,
      models: item.models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barReport.combineReportFilters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = await barReport.fetchSql(
    {
      traceId: item.traceId,
      entities: entities,
      models: item.models,
      udfsDict: item.udfsDict,
      weekStart: item.weekStart,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    rabbitService,
    cs
  );

  return entities;
}

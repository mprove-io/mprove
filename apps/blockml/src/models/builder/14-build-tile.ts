import { PostgresConnection } from '@malloydata/db-postgres';
import { ConfigService } from '@nestjs/config';
import { barTile } from '~blockml/barrels/bar-tile';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { RabbitService } from '~blockml/services/rabbit.service';

export async function buildTile<T extends types.dzType>(
  item: {
    traceId: string;
    entities: T[];
    models: common.FileModel[];
    stores: common.FileStore[];
    mods: common.FileMod[];
    apiModels: common.Model[];
    malloyConnections: PostgresConnection[];
    malloyFiles: common.BmlFile[];
    udfsDict: common.UdfsDict;
    weekStart: common.ProjectWeekStartEnum;
    timezone: string;
    caseSensitiveStringFilters: boolean;
    simplifySafeAggregates: boolean;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>,
  rabbitService: RabbitService
) {
  let entities = item.entities;

  entities = barTile.checkTileIsObject(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barTile.checkTileUnknownParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barTile.checkTileTitleModelSelect(
    {
      entities: entities,
      models: item.models,
      stores: item.stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barTile.checkSelectElements(
    {
      entities: entities,
      models: item.models,
      stores: item.stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barTile.checkSorts(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barTile.checkLimit(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barTile.checkTileParameters(
    {
      entities: entities,
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
      models: item.models,
      apiModels: item.apiModels,
      mods: item.mods,
      stores: item.stores,
      malloyFiles: item.malloyFiles,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = await barTile.fetchSql(
    {
      traceId: item.traceId,
      entities: entities,
      models: item.models,
      mods: item.mods,
      apiModels: item.apiModels,
      malloyConnections: item.malloyConnections,
      malloyFiles: item.malloyFiles,
      udfsDict: item.udfsDict,
      weekStart: item.weekStart,
      timezone: item.timezone,
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
      simplifySafeAggregates: item.simplifySafeAggregates,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    rabbitService,
    cs
  );

  return entities;
}

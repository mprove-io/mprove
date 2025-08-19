import { PostgresConnection } from '@malloydata/db-postgres';
import { ConfigService } from '@nestjs/config';
import { barTile } from '~blockml/barrels/bar-tile';
import { BmError } from '~blockml/models/bm-error';
import { RabbitService } from '~blockml/services/rabbit.service';
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';

export async function buildTile<T extends dcType>(
  item: {
    traceId: string;
    envId: string;
    projectId: string;
    entities: T[];
    stores: FileStore[];
    mods: FileMod[];
    apiModels: Model[];
    malloyConnections: PostgresConnection[];
    projectConnections: ProjectConnection[];
    malloyFiles: BmlFile[];
    weekStart: ProjectWeekStartEnum;
    timezone: string;
    caseSensitiveStringFilters: boolean;
    simplifySafeAggregates: boolean;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>,
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
      apiModels: item.apiModels,
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
      apiModels: item.apiModels,
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
      apiModels: item.apiModels,
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
      mods: item.mods,
      apiModels: item.apiModels,
      malloyConnections: item.malloyConnections,
      projectConnections: item.projectConnections,
      malloyFiles: item.malloyFiles,
      weekStart: item.weekStart,
      timezone: item.timezone,
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
      simplifySafeAggregates: item.simplifySafeAggregates,
      envId: item.envId,
      projectId: item.projectId,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    rabbitService,
    cs
  );

  return entities;
}

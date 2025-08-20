import { PostgresConnection } from '@malloydata/db-postgres';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { RabbitService } from '~blockml/services/rabbit.service';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { FileMod } from '~common/interfaces/blockml/internal/file-mod';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Model } from '~common/interfaces/blockml/model';
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';
import { dcType } from '~common/types/dc-type';
import { checkLimit } from './check-limit';
import { checkSelectElements } from './check-select-elements';
import { checkSorts } from './check-sorts';
import { checkTileIsObject } from './check-tile-is-object';
import { checkTileParameters } from './check-tile-parameters';
import { checkTileTitleModelSelect } from './check-tile-title-model-select';
import { checkTileUnknownParameters } from './check-tile-unknown-parameters';
import { fetchSql } from './fetch-sql';

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

  entities = checkTileIsObject(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkTileUnknownParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkTileTitleModelSelect(
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

  entities = checkSelectElements(
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

  entities = checkSorts(
    {
      entities: entities,
      apiModels: item.apiModels,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkLimit(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkTileParameters(
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

  entities = await fetchSql(
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

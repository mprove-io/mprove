import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { MconfigParentTypeEnum } from '~common/enums/mconfig-parent-type.enum';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Model } from '~common/interfaces/blockml/model';
import { dcType } from '~common/types/dc-type';
import { MalloyConnection } from '~node-common/functions/make-malloy-connections';
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
    mconfigParentType: MconfigParentTypeEnum;
    stores: FileStore[];
    apiModels: Model[];
    malloyConnections: MalloyConnection[];
    projectConnections: ProjectConnection[];
    weekStart: ProjectWeekStartEnum;
    timezone: string;
    caseSensitiveStringFilters: boolean;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
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
      stores: item.stores,
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
      mconfigParentType: item.mconfigParentType,
      apiModels: item.apiModels,
      malloyConnections: item.malloyConnections,
      projectConnections: item.projectConnections,
      weekStart: item.weekStart,
      timezone: item.timezone,
      caseSensitiveStringFilters: item.caseSensitiveStringFilters,
      envId: item.envId,
      projectId: item.projectId,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return entities;
}

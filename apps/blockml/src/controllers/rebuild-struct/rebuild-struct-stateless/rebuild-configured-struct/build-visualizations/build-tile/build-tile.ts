import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import type { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import type { dcType } from '#common/types/dc-type';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { SelectedGiven } from '#common/zod/backend/selected-given';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import type { MalloyConnection } from '#node-common/functions/make-malloy-connections';
import { checkLimit } from './check-limit/check-limit';
import { checkSelectElements } from './check-select-elements/check-select-elements';
import { checkSorts } from './check-sorts/check-sorts';
import { checkTileIsObject } from './check-tile-is-object/check-tile-is-object';
import { checkTileParameters } from './check-tile-parameters/check-tile-parameters';
import { checkTileTitleModelSelect } from './check-tile-title-model-select/check-tile-title-model-select';
import { checkTileUnknownParameters } from './check-tile-unknown-parameters/check-tile-unknown-parameters';
import { fetchSql } from './fetch-sql/fetch-sql';

export async function buildTile<T extends dcType>(item: {
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
  selectedGivens: SelectedGiven[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.ResultAsync<T[], never> {
  let {
    envId,
    projectId,
    entities,
    mconfigParentType,
    stores,
    apiModels,
    malloyConnections,
    projectConnections,
    weekStart,
    timezone,
    caseSensitiveStringFilters,
    selectedGivens,
    errors,
    structId,
    caller,
    cs
  } = item;

  entities = checkTileIsObject(
    {
      entities: entities,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  entities = checkTileUnknownParameters(
    {
      entities: entities,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  entities = checkTileTitleModelSelect(
    {
      entities: entities,
      apiModels: apiModels,
      stores: stores,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  entities = checkSelectElements(
    {
      entities: entities,
      apiModels: apiModels,
      stores: stores,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  entities = checkSorts(
    {
      entities: entities,
      apiModels: apiModels,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  entities = checkLimit(
    {
      entities: entities,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  entities = checkTileParameters(
    {
      entities: entities,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      apiModels: apiModels,
      stores: stores,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  entities = await fetchSql(
    {
      entities: entities,
      mconfigParentType: mconfigParentType,
      apiModels: apiModels,
      malloyConnections: malloyConnections,
      projectConnections: projectConnections,
      weekStart: weekStart,
      timezone: timezone,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      selectedGivens: selectedGivens,
      envId: envId,
      projectId: projectId,
      structId: structId,
      errors: errors,
      caller: caller
    },
    cs
  );

  return Result.succeed(entities);
}

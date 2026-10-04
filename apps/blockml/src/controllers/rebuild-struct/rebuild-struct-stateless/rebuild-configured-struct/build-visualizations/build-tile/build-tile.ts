import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { dcType } from '#common/types/blockml/parts/internal/dc-type';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { MalloyConnection } from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
import { checkLimit } from './check-limit/check-limit';
import { checkSelectElements } from './check-select-elements/check-select-elements';
import { checkSorts } from './check-sorts/check-sorts';
import { checkTileIsObject } from './check-tile-is-object/check-tile-is-object';
import { checkTileParameters } from './check-tile-parameters/check-tile-parameters';
import { checkTileTitleModelSelect } from './check-tile-title-model-select/check-tile-title-model-select';
import { checkTileUnknownParameters } from './check-tile-unknown-parameters/check-tile-unknown-parameters';
import { fetchSql } from './fetch-sql/fetch-sql';

export function buildTile<T extends dcType>(item: {
  envId: string;
  projectId: string;
  entities: T[];
  mconfigParentType: MconfigParentType;
  stores: FileStore[];
  apiModels: Model[];
  malloyConnections: MalloyConnection[];
  projectConnections: ProjectConnection[];
  weekStart: ProjectWeekStart;
  timezone: string;
  caseSensitiveStringFilters: boolean;
  selectedGivens: SelectedGiven[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.ResultAsync<T[], never> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'objectCheckedEntities',
      (v): Result.Result<T[], never> =>
        checkTileIsObject({
          entities: v.entities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'unknownParametersCheckedEntities',
      (v): Result.Result<T[], never> =>
        checkTileUnknownParameters({
          entities: v.objectCheckedEntities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'titleModelSelectCheckedEntities',
      (v): Result.Result<T[], never> =>
        checkTileTitleModelSelect({
          entities: v.unknownParametersCheckedEntities,
          apiModels: v.apiModels,
          stores: v.stores,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'selectElementsCheckedEntities',
      (v): Result.Result<T[], never> =>
        checkSelectElements({
          entities: v.titleModelSelectCheckedEntities,
          apiModels: v.apiModels,
          stores: v.stores,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'sortsCheckedEntities',
      (v): Result.Result<T[], never> =>
        checkSorts({
          entities: v.selectElementsCheckedEntities,
          apiModels: v.apiModels,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'limitCheckedEntities',
      (v): Result.Result<T[], never> =>
        checkLimit({
          entities: v.sortsCheckedEntities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'parametersCheckedEntities',
      (v): Result.Result<T[], never> =>
        checkTileParameters({
          entities: v.limitCheckedEntities,
          caseSensitiveStringFilters: v.caseSensitiveStringFilters,
          apiModels: v.apiModels,
          stores: v.stores,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.andThen(
      (v): Result.ResultAsync<T[], never> =>
        fetchSql({
          entities: v.parametersCheckedEntities,
          mconfigParentType: v.mconfigParentType,
          apiModels: v.apiModels,
          malloyConnections: v.malloyConnections,
          projectConnections: v.projectConnections,
          weekStart: v.weekStart,
          timezone: v.timezone,
          caseSensitiveStringFilters: v.caseSensitiveStringFilters,
          selectedGivens: v.selectedGivens,
          envId: v.envId,
          projectId: v.projectId,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    )
  );
}

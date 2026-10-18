import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { FilePartTileExtra } from '#blockml/types/file-part-tile-extra';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FetchSqlError } from '#common/types/blockml/function-errors/fetch-sql-error';
import type { FetchTileSqlError } from '#common/types/blockml/function-errors/fetch-tile-sql-error';
import type { dcType } from '#common/types/blockml/parts/internal/dc-type';
import type { FileChart } from '#common/types/blockml/parts/internal/file-chart';
import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { Model } from '#common/types/blockml/parts/model/model';
import { customAsyncPool } from '#node-common/functions/custom-async-pool/custom-async-pool';
import type { MalloyConnection } from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
import { fetchTileSql } from './fetch-tile-sql/fetch-tile-sql';

let func: Func = 'build-tile/fetch-sql';

export async function fetchSql<T extends dcType>(item: {
  envId: string;
  projectId: string;
  entities: T[];
  mconfigParentType: MconfigParentType;
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
}): Result.ResultAsync<T[], FetchSqlError> {
  let { cs, ...input } = item;

  let { caller, structId, timezone, envId, projectId, mconfigParentType } =
    item;

  log(cs, caller, func, structId, 'input.log', input);

  let tiles: FilePartTileExtra[] = [];

  item.entities.forEach(x => {
    x.tiles.forEach(tile => {
      (tile as FilePartTileExtra).mconfigParentId =
        mconfigParentType === 'Chart'
          ? (x as FileChart).chart
          : mconfigParentType === 'Dashboard'
            ? (x as FileDashboard).dashboard
            : undefined;
      (tile as FilePartTileExtra).filePath = x.filePath;
      (tile as FilePartTileExtra).fileName = x.fileName;
    });

    tiles = [...tiles, ...(x.tiles as FilePartTileExtra[])];
  });

  let concurrencyLimit =
    cs.get<BlockmlConfig['concurrencyLimit']>('concurrencyLimit');

  let fetchSqlOutput: Result.Result<void[], FetchSqlError> =
    await customAsyncPool({
      poolSize: concurrencyLimit,
      inputs: tiles,
      callback: (
        tile: FilePartTileExtra
      ): Result.ResultAsync<void, FetchTileSqlError> =>
        fetchTileSql({
          tile: tile,
          apiModels: item.apiModels,
          structId: structId,
          mconfigParentType: mconfigParentType,
          timezone: timezone,
          projectId: projectId,
          envId: envId,
          malloyConnections: item.malloyConnections,
          selectedGivens: item.selectedGivens
        })
    });

  if (Result.isFailure(fetchSqlOutput)) {
    return fetchSqlOutput;
  }

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', item.entities);

  return Result.succeed(item.entities);
}

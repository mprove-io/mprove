import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import asyncPool from 'tiny-async-pool';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { FilePartTileExtra } from '#blockml/types/file-part-tile-extra';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { QueryOperation } from '#common/types/backend/parts/query-operation/query-operation';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { dcType } from '#common/types/blockml/parts/internal/dc-type';
import type { FileChart } from '#common/types/blockml/parts/internal/file-chart';
import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { Model } from '#common/types/blockml/parts/model/model';
import { addTraceSpan } from '#node-common/functions/add-trace-span/add-trace-span';
import { bricksToFractions } from '#node-common/functions/bricks-to-fractions/bricks-to-fractions';
import type { MalloyConnection } from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
import { makeMalloyQuery } from '#node-common/functions/malloy/make-malloy-query/make-malloy-query';

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
}): Result.ResultAsync<T[], never> {
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

  await asyncPool(concurrencyLimit, tiles, async (tile: FilePartTileExtra) => {
    let apiModel = item.apiModels.find(y => y.modelId === tile.model);

    if (apiModel.type === 'Malloy') {
      let newMconfigId = makeId();
      let newQueryId = makeId();

      let mconfig: Mconfig = {
        structId: structId,
        mconfigId: newMconfigId,
        queryId: newQueryId,
        modelId: apiModel.modelId,
        modelType: apiModel.type,
        parentType: mconfigParentType,
        parentId: tile.mconfigParentId,
        dateRangeIncludesRightSide: undefined,
        storePart: undefined,
        modelLabel: apiModel.label,
        modelFilePath: apiModel.filePath,
        malloyQueryStable: undefined,
        malloyQueryExtra: undefined,
        compiledQuery: undefined,
        select: [],
        sortings: [],
        sorts: undefined,
        timezone: timezone,
        limit: undefined,
        filters: [],
        appliedGivens: undefined,
        chart: makeCopy(DEFAULT_CHART),
        serverTs: 1
      };

      let startFetchSqlMalloyQuery = Date.now();

      let mFilters: { fieldId: string; fractions: Fraction[] }[] = [];

      let filtersFractions: { [s: string]: Fraction[] } = {};

      Object.keys(tile.combinedFilters).forEach(fieldId => {
        let modelField = apiModel.fields.find(x => x.id === fieldId);

        let fractions: Fraction[] = [];

        let pf = bricksToFractions({
          filterBricks: tile.combinedFilters[fieldId],
          result: modelField.result,
          isGetTimeRange: false,
          fractions: fractions
        });

        mFilters.push({
          fieldId: fieldId,
          fractions: fractions
        });

        filtersFractions[fieldId] = fractions;
      });

      let editMalloyQueryResult = await addTraceSpan({
        spanName: 'blockml.makeMalloyQuery',
        fn: () =>
          makeMalloyQuery({
            projectId: projectId,
            envId: envId,
            structId: structId,
            mconfigParentType: mconfigParentType,
            mconfigParentId: tile.mconfigParentId,
            model: apiModel,
            mconfig: mconfig,
            malloyConnections: item.malloyConnections,
            selectedGivens: item.selectedGivens,
            queryOperations: [
              ...tile.select.map(x => {
                let op: QueryOperation = {
                  type: 'GroupOrAggregate',
                  timezone: timezone,
                  fieldId: x
                };
                return op;
              }),
              {
                type: 'Limit',
                timezone: timezone,
                limit: Number(tile.limit)
              },
              {
                type: 'WhereOrHaving',
                timezone: timezone,
                filters: mFilters
              },
              ...tile.sortingsAry.map(x => {
                let op: QueryOperation = {
                  type: 'Sort',
                  sortFieldId: x.fieldId,
                  desc: x.desc,
                  timezone: timezone
                };
                return op;
              })
            ]
          })
      });

      let newMconfig = editMalloyQueryResult.apiNewMconfig;
      let newQuery = editMalloyQueryResult.apiNewQuery;
      let isError = editMalloyQueryResult.isError;

      tile.compiledQuery = newMconfig.compiledQuery;
      tile.sql = newMconfig.compiledQuery.sql.split('\n');
      tile.malloyQueryStable = newMconfig.malloyQueryStable;
      tile.malloyQueryExtra = newMconfig.malloyQueryExtra;
      tile.appliedGivens = newMconfig.appliedGivens;
      tile.filtersFractions = filtersFractions;
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', item.entities);

  return Result.succeed(item.entities);
}

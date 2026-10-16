import { Result } from '@praha/byethrow';
import type { FilePartTileExtra } from '#blockml/types/file-part-tile-extra';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { QueryOperation } from '#common/types/backend/parts/query-operation/query-operation';
import type { FetchTileSqlError } from '#common/types/blockml/function-errors/fetch-tile-sql-error';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { MakeMalloyQueryError } from '#common/types/node-common/function-errors/make-malloy-query-error';
import { addTraceSpan } from '#node-common/functions/add-trace-span/add-trace-span';
import { bricksToFractions } from '#node-common/functions/bricks-to-fractions/bricks-to-fractions';
import type { MalloyConnection } from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
import {
  type MalloyQueryResult,
  makeMalloyQueryResult
} from '#node-common/functions/malloy/make-malloy-query/make-malloy-query';

export async function fetchTileSql(item: {
  tile: FilePartTileExtra;
  apiModels: Model[];
  structId: string;
  mconfigParentType: MconfigParentType;
  timezone: string;
  projectId: string;
  envId: string;
  malloyConnections: MalloyConnection[];
  selectedGivens: SelectedGiven[];
}): Result.ResultAsync<void, FetchTileSqlError> {
  let {
    tile,
    apiModels,
    structId,
    mconfigParentType,
    timezone,
    projectId,
    envId,
    malloyConnections,
    selectedGivens
  } = item;

  let apiModel: Model = apiModels.find(y => y.modelId === tile.model);

  if (apiModel.type === 'Malloy') {
    let newMconfigId: string = makeId();

    let newQueryId: string = makeId();

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

    let mFilters: { fieldId: string; fractions: Fraction[] }[] = [];

    let filtersFractions: { [s: string]: Fraction[] } = {};

    Object.keys(tile.combinedFilters).forEach(fieldId => {
      let modelField: ModelField = apiModel.fields.find(x => x.id === fieldId);

      let fractions: Fraction[] = [];

      bricksToFractions({
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

    let malloyQueryResult: Result.Result<
      MalloyQueryResult,
      MakeMalloyQueryError
    > = await addTraceSpan({
      spanName: 'blockml.makeMalloyQuery',
      fn: () =>
        makeMalloyQueryResult({
          projectId: projectId,
          envId: envId,
          structId: structId,
          mconfigParentType: mconfigParentType,
          mconfigParentId: tile.mconfigParentId,
          model: apiModel,
          mconfig: mconfig,
          malloyConnections: malloyConnections,
          selectedGivens: selectedGivens,
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

    if (Result.isFailure(malloyQueryResult)) {
      return malloyQueryResult;
    }

    let newMconfig: Mconfig = malloyQueryResult.value.apiNewMconfig;

    tile.compiledQuery = newMconfig.compiledQuery;
    tile.sql = newMconfig.compiledQuery.sql.split('\n');
    tile.malloyQueryStable = newMconfig.malloyQueryStable;
    tile.malloyQueryExtra = newMconfig.malloyQueryExtra;
    tile.appliedGivens = newMconfig.appliedGivens;
    tile.filtersFractions = filtersFractions;
  }

  return Result.succeed();
}

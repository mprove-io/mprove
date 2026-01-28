import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { makeCopy } from '#common/functions/make-copy';
import { makeId } from '#common/functions/make-id';
import { ProjectConnection } from '#common/interfaces/backend/project-connection';
import { QueryOperation } from '#common/interfaces/backend/query-operation';
import { Fraction } from '#common/interfaces/blockml/fraction';
import { FileChart } from '#common/interfaces/blockml/internal/file-chart';
import { FileDashboard } from '#common/interfaces/blockml/internal/file-dashboard';
import { FilePartTile } from '#common/interfaces/blockml/internal/file-part-tile';
import { Mconfig } from '#common/interfaces/blockml/mconfig';
import { Model } from '#common/interfaces/blockml/model';
import { dcType } from '#common/types/dc-type';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { bricksToFractions } from '#node-common/functions/bricks-to-fractions';
import { MalloyConnection } from '#node-common/functions/make-malloy-connections';
import { makeMalloyQuery } from '#node-common/functions/make-malloy-query';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { log } from '../extra/log';

let func = FuncEnum.FetchSql;

interface FilePartTileExtra extends FilePartTile {
  mconfigParentId: string;
  filePath: string;
  fileName: string;
}

export async function fetchSql<T extends dcType>(
  item: {
    traceId: string;
    envId: string;
    projectId: string;
    entities: T[];
    mconfigParentType: MconfigParentTypeEnum;
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
  let { caller, structId, timezone, envId, projectId, mconfigParentType } =
    item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let tiles: FilePartTileExtra[] = [];

  item.entities.forEach(x => {
    x.tiles.forEach(tile => {
      (tile as FilePartTileExtra).mconfigParentId =
        mconfigParentType === MconfigParentTypeEnum.Chart
          ? (x as FileChart).chart
          : mconfigParentType === MconfigParentTypeEnum.Dashboard
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

    if (apiModel.type === ModelTypeEnum.Malloy) {
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
            queryOperations: [
              ...tile.select.map(x => {
                let op: QueryOperation = {
                  type: QueryOperationTypeEnum.GroupOrAggregate,
                  timezone: timezone,
                  fieldId: x
                };
                return op;
              }),
              {
                type: QueryOperationTypeEnum.Limit,
                timezone: timezone,
                limit: Number(tile.limit)
              },
              {
                type: QueryOperationTypeEnum.WhereOrHaving,
                timezone: timezone,
                filters: mFilters
              },
              ...tile.sortingsAry.map(x => {
                let op: QueryOperation = {
                  type: QueryOperationTypeEnum.Sort,
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
      tile.filtersFractions = filtersFractions;
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, item.entities);

  return item.entities;
}

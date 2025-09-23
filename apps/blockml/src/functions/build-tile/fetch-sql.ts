import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { DEFAULT_CHART } from '~common/constants/mconfig-chart';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { QueryOperationTypeEnum } from '~common/enums/query-operation-type.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { QueryOperation } from '~common/interfaces/backend/query-operation';
import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FileMod } from '~common/interfaces/blockml/internal/file-mod';
import { FilePartTile } from '~common/interfaces/blockml/internal/file-part-tile';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Model } from '~common/interfaces/blockml/model';
import { dcType } from '~common/types/dc-type';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';
import { MalloyConnection } from '~node-common/functions/make-malloy-connections';
import { makeMalloyQuery } from '~node-common/functions/make-malloy-query';
import { log } from '../extra/log';

let func = FuncEnum.FetchSql;

interface FilePartTileExtra extends FilePartTile {
  filePath?: string;
  fileName?: string;
}

export async function fetchSql<T extends dcType>(
  item: {
    traceId: string;
    envId: string;
    projectId: string;
    entities: T[];
    mods: FileMod[];
    apiModels: Model[];
    malloyConnections: MalloyConnection[];
    projectConnections: ProjectConnection[];
    malloyFiles: BmlFile[];
    weekStart: ProjectWeekStartEnum;
    timezone: string;
    simplifySafeAggregates: boolean;
    caseSensitiveStringFilters: boolean;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, timezone, envId, projectId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let tiles: FilePartTileExtra[] = [];

  item.entities.forEach(x => {
    tiles = [
      ...tiles,
      ...x.tiles.map(tile => {
        (tile as FilePartTileExtra).filePath = x.filePath;
        (tile as FilePartTileExtra).fileName = x.fileName;
        return tile;
      })
    ];
  });

  let concurrencyLimit =
    cs.get<BlockmlConfig['concurrencyLimit']>('concurrencyLimit');

  await asyncPool(concurrencyLimit, tiles, async (tile: FilePartTileExtra) => {
    let apiModel = item.apiModels.find(y => y.modelId === tile.model);

    if (apiModel.type === ModelTypeEnum.Malloy) {
      // console.log('tile');
      // console.log(tile);

      // let malloyFile = item.malloyFiles.find(
      //   file =>
      //     file.path ===
      //     tile.filePath.substring(0, tile.filePath.lastIndexOf('.')) + '.malloy'
      // );

      // if (isUndefined(malloyFile)) {
      //   // TODO: error
      // }

      // let { mod, malloyQuery } = getModAndMalloyQuery({
      //   tileQuery: tile.query,
      //   malloyFile: malloyFile,
      //   mods: item.mods,
      //   malloyFiles: item.malloyFiles
      // });

      // let apiModel = item.apiModels.find(y => y.modelId === mod.name);

      let newMconfigId = makeId();
      let newQueryId = makeId();

      let mconfig: Mconfig = {
        structId: structId,
        mconfigId: newMconfigId,
        queryId: newQueryId,
        modelId: apiModel.modelId,
        modelType: apiModel.type,
        dateRangeIncludesRightSide: undefined,
        storePart: undefined,
        modelLabel: apiModel.label,
        modelFilePath: apiModel.filePath,
        malloyQuery: undefined,
        compiledQuery: undefined,
        select: [],
        // unsafeSelect: [],
        // warnSelect: [],
        // joinAggregations: [],
        sortings: [],
        sorts: undefined,
        timezone: timezone,
        limit: undefined,
        filters: [],
        chart: makeCopy(DEFAULT_CHART),
        temp: true,
        serverTs: 1
        // fields: [],
        // extendedFilters: [],
      };

      let startFetchSqlMalloyQuery = Date.now();

      let mFilters: { fieldId: string; fractions: Fraction[] }[] = [];

      let filtersFractions: { [s: string]: Fraction[] } = {};

      Object.keys(tile.combinedFilters).forEach(fieldId => {
        let modelField = apiModel.fields.find(x => x.id === fieldId);

        let fractions: Fraction[] = [];

        let pf = bricksToFractions({
          // caseSensitiveStringFilters: caseSensitiveStringFilters,
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

      let editMalloyQueryResult = await makeMalloyQuery({
        projectId: projectId,
        envId: envId,
        structId: structId,
        model: apiModel,
        mconfig: mconfig,
        malloyConnections: item.malloyConnections,
        projectConnection: item.projectConnections.find(
          x => x.connectionId === apiModel.connectionId
        ),
        queryOperations: [
          // {
          //   type: QueryOperationTypeEnum.GroupOrAggregatePlusSort,
          //   timezone: timezone,
          //   fieldId: select[0],
          //   sortFieldId: select[0],
          //   desc: isDesc
          // },
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
            // fieldId: filter.fieldId,
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
      });

      let newMconfig = editMalloyQueryResult.newMconfig;
      let newQuery = editMalloyQueryResult.newQuery;
      let isError = editMalloyQueryResult.isError;

      // let { preparedResult, filtersFractions, newMalloyQuery } =
      //   await buildMalloyQuery(
      //     {
      //       apiModel: apiModel,
      //       malloyConnections: item.malloyConnections,
      //       malloyModelDef: mod.malloyModel._modelDef,
      //       malloyQuery: malloyQuery,
      //       malloyEntryValueWithSource: mod.valueWithSourceInfo,
      //       combinedFilters: tile.combinedFilters
      //     },
      //     cs
      //   );

      // console.log('filtersFractions');
      // console.log(filtersFractions);

      // console.log('fetchSqlMalloyQuery:');
      // console.log(Date.now() - startFetchSqlMalloyQuery);

      tile.compiledQuery = newMconfig.compiledQuery;
      tile.sql = newMconfig.compiledQuery.sql.split('\n');
      tile.malloyQuery = newMconfig.malloyQuery;
      tile.filtersFractions = filtersFractions;
      // tile.select = [];
      // tile.model = preparedResult._rawQuery.sourceExplore;
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, item.entities);

  return item.entities;
}

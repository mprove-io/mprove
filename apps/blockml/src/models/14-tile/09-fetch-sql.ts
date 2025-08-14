import { PostgresConnection } from '@malloydata/db-postgres';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { RabbitService } from '~blockml/services/rabbit.service';
import { ProjectConnection } from '~common/_index';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';
import { makeMalloyQuery } from '~node-common/functions/make-malloy-query';

let func = common.FuncEnum.FetchSql;

interface FilePartTileExtra extends common.FilePartTile {
  filePath?: string;
  fileName?: string;
}

export async function fetchSql<T extends types.dzType>(
  item: {
    traceId: string;
    envId: string;
    projectId: string;
    entities: T[];
    models: common.FileModel[];
    mods: common.FileMod[];
    apiModels: common.Model[];
    malloyConnections: PostgresConnection[];
    projectConnections: ProjectConnection[];
    malloyFiles: common.BmlFile[];
    udfsDict: common.UdfsDict;
    weekStart: common.ProjectWeekStartEnum;
    timezone: string;
    simplifySafeAggregates: boolean;
    caseSensitiveStringFilters: boolean;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  rabbitService: RabbitService,
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, timezone, envId, projectId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

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
    cs.get<interfaces.Config['concurrencyLimit']>('concurrencyLimit');

  await asyncPool(concurrencyLimit, tiles, async (tile: FilePartTileExtra) => {
    let apiModel = item.apiModels.find(y => y.modelId === tile.model);

    if (apiModel.type === common.ModelTypeEnum.Malloy) {
      // console.log('tile');
      // console.log(tile);

      // let malloyFile = item.malloyFiles.find(
      //   file =>
      //     file.path ===
      //     tile.filePath.substring(0, tile.filePath.lastIndexOf('.')) + '.malloy'
      // );

      // if (common.isUndefined(malloyFile)) {
      //   // TODO: error
      // }

      // let { mod, malloyQuery } = getModAndMalloyQuery({
      //   tileQuery: tile.query,
      //   malloyFile: malloyFile,
      //   mods: item.mods,
      //   malloyFiles: item.malloyFiles
      // });

      // let apiModel = item.apiModels.find(y => y.modelId === mod.name);

      let newMconfigId = common.makeId();
      let newQueryId = common.makeId();

      let mconfig: common.Mconfig = {
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
        unsafeSelect: [],
        warnSelect: [],
        joinAggregations: [],
        sortings: [],
        sorts: undefined,
        timezone: timezone,
        limit: undefined,
        filters: [],
        chart: common.makeCopy(common.DEFAULT_CHART),
        temp: true,
        serverTs: 1
        // fields: [],
        // extendedFilters: [],
      };

      let startBuildMalloyQuery = Date.now();

      let mFilters: { fieldId: string; fractions: common.Fraction[] }[] = [];

      let filtersFractions: { [s: string]: common.Fraction[] } = {};

      Object.keys(tile.combinedFilters).forEach(fieldId => {
        let modelField = apiModel.fields.find(x => x.id === fieldId);

        let fractions: common.Fraction[] = [];

        let pf = bricksToFractions({
          // caseSensitiveStringFilters: caseSensitiveStringFilters,
          filterBricks: tile.combinedFilters[fieldId],
          result: modelField.result,
          getTimeRange: false,
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
          x => x.connectionId === apiModel.modelId
        ),
        queryOperations: [
          // {
          //   type: common.QueryOperationTypeEnum.GroupOrAggregatePlusSort,
          //   timezone: timezone,
          //   fieldId: select[0],
          //   sortFieldId: select[0],
          //   desc: isDesc
          // },
          ...tile.select.map(x => {
            let op: common.QueryOperation = {
              type: common.QueryOperationTypeEnum.GroupOrAggregate,
              timezone: timezone,
              fieldId: x
            };
            return op;
          }),
          {
            type: common.QueryOperationTypeEnum.Limit,
            timezone: timezone,
            limit: Number(tile.limit)
          },
          {
            type: common.QueryOperationTypeEnum.WhereOrHaving,
            timezone: timezone,
            // fieldId: filter.fieldId,
            filters: mFilters
          },
          ...tile.sortingsAry.map(x => {
            let op: common.QueryOperation = {
              type: common.QueryOperationTypeEnum.Sort,
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
      //   await barSpecial.buildMalloyQuery(
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

      console.log('buildMalloyQuery:');
      console.log(Date.now() - startBuildMalloyQuery);

      tile.sql = editMalloyQueryResult.newMconfig.compiledQuery.sql.split('\n');
      tile.malloyQuery = editMalloyQueryResult.newMconfig.compiledQuery.malloy;
      tile.compiledQuery = editMalloyQueryResult.newMconfig.compiledQuery;
      tile.filtersFractions = filtersFractions;
      // tile.select = [];
      // tile.model = preparedResult._rawQuery.sourceExplore;
    } else if (
      apiModel.type === common.ModelTypeEnum.SQL
      // common.isDefined(tile.model) &&
      // tile.model.startsWith(STORE_MODEL_PREFIX) === false
    ) {
      let model = item.models.find(m => m.name === tile.model);

      let filters: common.FilterBricksDictionary = {};

      if (common.isDefined(tile.combinedFilters)) {
        Object.keys(tile.combinedFilters).forEach(filter => {
          // remove empty filters
          if (tile.combinedFilters[filter].length > 0) {
            filters[filter] = tile.combinedFilters[filter];
          }
        });
      }

      tile.combinedFilters = filters;

      let {
        sql,
        filtersFractions,
        varsSqlSteps,
        joinAggregations,
        unsafeSelect,
        warnSelect
      } = await barSpecial.genSql(rabbitService, cs, item.traceId, {
        weekStart: item.weekStart,
        caseSensitiveStringFilters: item.caseSensitiveStringFilters,
        simplifySafeAggregates: item.simplifySafeAggregates,
        timezone: timezone,
        select: tile.select,
        sorts: tile.sorts,
        limit: tile.limit,
        filters: tile.combinedFilters,
        model: model,
        udfsDict: item.udfsDict
      });

      tile.sql = sql;
      tile.filtersFractions = filtersFractions;
      tile.joinAggregations = joinAggregations;
      tile.unsafeSelect = unsafeSelect;
      tile.warnSelect = warnSelect;
      tile.varsSqlSteps = varsSqlSteps;
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    item.entities
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Models,
    item.models
  );

  return item.entities;
}

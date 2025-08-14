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
import { STORE_MODEL_PREFIX } from '~common/constants/top';
import { getModAndMalloyQuery } from '~node-common/functions/get-mod-and-malloy-query';

let func = common.FuncEnum.FetchSql;

interface FilePartTileExtra extends common.FilePartTile {
  filePath?: string;
  fileName?: string;
}

export async function fetchSql<T extends types.dzType>(
  item: {
    traceId: string;
    entities: T[];
    models: common.FileModel[];
    mods: common.FileMod[];
    apiModels: common.Model[];
    malloyConnections: PostgresConnection[];
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
  let { caller, structId, timezone } = item;
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
    if (common.isDefined(tile.query)) {
      console.log('tile');
      console.log(tile);

      let malloyFile = item.malloyFiles.find(
        file =>
          file.path ===
          tile.filePath.substring(0, tile.filePath.lastIndexOf('.')) + '.malloy'
      );

      if (common.isUndefined(malloyFile)) {
        // TODO: error
      }

      let { mod, malloyQuery } = getModAndMalloyQuery({
        tileQuery: tile.query,
        malloyFile: malloyFile,
        mods: item.mods,
        malloyFiles: item.malloyFiles
      });

      let apiModel = item.apiModels.find(y => y.modelId === mod.name);

      let startBuildMalloyQuery = Date.now();

      let { preparedResult, filtersFractions } =
        await barSpecial.buildMalloyQuery(
          {
            apiModel: apiModel,
            malloyConnections: item.malloyConnections,
            malloyModelDef: mod.malloyModel._modelDef,
            malloyQuery: malloyQuery,
            malloyEntryValueWithSource: mod.valueWithSourceInfo
          },
          cs
        );

      console.log('filtersFractions');
      console.log(filtersFractions);

      console.log('buildMalloyQuery:');
      console.log(Date.now() - startBuildMalloyQuery);

      tile.sql = preparedResult.sql.split('\n');
      tile.model = preparedResult._rawQuery.sourceExplore;
      tile.malloyQuery = malloyQuery;
      tile.compiledQuery = preparedResult._rawQuery;
      tile.select = [];
      tile.filtersFractions = filtersFractions;
    } else if (
      common.isDefined(tile.model) &&
      tile.model.startsWith(STORE_MODEL_PREFIX) === false
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

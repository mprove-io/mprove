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
      let qr = await barSpecial.buildMalloyQuery(
        {
          malloyFiles: item.malloyFiles,
          malloyConnections: item.malloyConnections,
          mods: item.mods,
          filePath: tile.filePath,
          fileName: tile.fileName,
          queryName: tile.query,
          queryLineNum: tile.query_line_num,
          errors: item.errors,
          structId: item.structId,
          caller: item.caller
        },
        cs
      );
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

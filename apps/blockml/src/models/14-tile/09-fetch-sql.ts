import { PostgresConnection } from '@malloydata/db-postgres';
import {
  ExpressionWithFieldReference,
  FilterWithFilterString
} from '@malloydata/malloy-interfaces';
import {
  ASTFilter,
  ASTFilterWithFilterString,
  ASTSegmentViewDefinition,
  ASTViewOperation,
  ASTWhereViewOperation,
  ParsedFilter
} from '@malloydata/malloy-query-builder';
// import { FilterMatchExpr } from '@malloydata/malloy/dist/model';
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
      // console.log('tile');
      // console.log(tile);

      let malloyFile = item.malloyFiles.find(
        file =>
          file.path ===
          tile.filePath.substring(0, tile.filePath.lastIndexOf('.')) + '.malloy'
      );

      if (common.isUndefined(malloyFile)) {
        // TODO: error
      }

      // tool
      // query:\s*(mc3)\s+is\s*([\s\S]*?)(?=(?:\nquery:\s*\w+\sis|source:\s|\nrun:\s|\nimport\s*{|\nimport\s*'|\nimport\s*"|$))

      let queryPattern = new RegExp(
        [
          `query:`,
          `\\s*`,
          `(${tile.query})`,
          `\\s+`,
          `is`,
          `\\s+`,
          `(\\w+)`,
          `\\s+`,
          `([\\s\\S]*?)`,
          `(?=`,
          `(?:`,
          `\\nquery:\\s*\\w+\\sis`,
          `|source:\\s`,
          `|\\nrun:\\s`,
          `|\\nimport\\s*\\{`,
          `|\\nimport\\s*\\'`,
          `|\\nimport\\s*\\"`,
          `|$`,
          `)`,
          `)`
        ].join(''),
        'g'
      );

      let source: string;
      let malloyQuery: string;

      let match = queryPattern.exec(malloyFile.content);

      if (common.isDefined(match)) {
        source = match[2];

        malloyQuery = 'run: ' + source + ' ' + match[3].trimEnd();

        // console.log('queryStr');
        // console.log(queryStr);
      }

      let mod = item.mods.find(x => x.source === source);

      let startBuildMalloyQuery = Date.now();
      let { preparedQuery, preparedResult, astQuery } =
        await barSpecial.buildMalloyQuery(
          {
            malloyConnections: item.malloyConnections,
            malloyModelDef: mod.malloyModel._modelDef,
            malloyQuery: malloyQuery,
            malloyEntryValueWithSource: mod.valueWithSourceInfo
          },
          cs
        );
      console.log('buildMalloyQuery:');
      console.log(Date.now() - startBuildMalloyQuery);

      tile.sql = preparedResult.sql.split('\n');
      tile.model = preparedResult._rawQuery.sourceExplore;
      tile.malloyQuery = malloyQuery;
      tile.compiledQuery = preparedResult._rawQuery;

      // console.dir('tile.compiledQuery');
      // console.dir(tile.compiledQuery, { depth: 5 });
      // console.dir('tile.compiledQuery.structs[0].filterList');
      // console.dir(tile.compiledQuery.structs[0].resultMetadata.filterList, {
      //   depth: 5
      // });

      // fse.writeFileSync(
      //   'malloy-preparedQuery.json',
      //   JSON.stringify(preparedQuery, null, 2),
      //   'utf-8'
      // );

      // fse.writeFileSync(
      //   'malloy-preparedResult.json',
      //   JSON.stringify(preparedResult, null, 2),
      //   'utf-8'
      // );

      let filtersFractions: {
        [s: string]: common.Fraction[];
      } = {};

      let apiModel = item.apiModels.find(y => y.modelId === mod.name);

      let segment0: ASTSegmentViewDefinition =
        astQuery.getOrAddDefaultSegment();

      console.log('operations:');
      let fs = segment0.operations.items
        .filter(
          (operation: ASTViewOperation) =>
            operation instanceof ASTWhereViewOperation
          // ||
          // operation instanceof ASTHavingViewOperation // TODO: having
        )
        .map((op: ASTWhereViewOperation) => {
          // console.log('op');
          // console.dir(op, { depth: null });

          let astFilter: ASTFilter = op.filter;

          let parsedFilter: ParsedFilter = (
            astFilter as ASTFilterWithFilterString
          ).getFilter();

          console.log('parsedFilter');
          console.dir(parsedFilter, { depth: null });

          let exp = op.node.filter.expression as ExpressionWithFieldReference;

          let fieldId = common.isDefined(exp.path)
            ? [...exp.path, exp.name].join('.')
            : exp.name;

          let field = apiModel.fields.find(k => k.id === fieldId);

          let fraction: common.Fraction;

          if (field.result === common.FieldResultEnum.String) {
            fraction = {
              // brick: `f'${(op.node.filter as FilterWithFilterString).filter}'`,
              brick: (op.node.filter as FilterWithFilterString).filter,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.StringIsEqualTo,
              stringValue: (op.node.filter as FilterWithFilterString).filter
            };
          }

          if (common.isDefined(filtersFractions[fieldId])) {
            filtersFractions[fieldId].push(fraction);
          } else {
            filtersFractions[fieldId] = [fraction];
          }

          return op.filter;
        });

      console.log('filtersFractions');
      console.log(filtersFractions);

      // console.log('filterList:');
      // tile.compiledQuery.structs[0].resultMetadata.filterList
      //   .filter(
      //     filterListItem =>
      //       filterListItem.isSourceFilter === false &&
      //       (
      //         (filterListItem?.stableFilter as MalloyFilterWithFilterString)
      //           ?.expression as MalloyExpressionWithFieldReference
      //       )?.kind === 'field_reference'
      //   )
      //   .forEach(x => {
      //     console.log('x');
      //     console.dir(x, { depth: null });

      //     let stableFilter = x.stableFilter as MalloyFilterWithFilterString;

      //     // console.log('stableFilter');
      //     // console.dir(stableFilter, { depth: null });

      //     let expression =
      //       stableFilter.expression as MalloyExpressionWithFieldReference;

      //     let fieldId =
      //       expression.path?.length > 0
      //         ? expression.path.join('.') + '.' + expression.name
      //         : expression.name;

      //     let field = apiModel.fields.find(k => k.id === fieldId);

      //     let fraction: common.Fraction;

      //     if (field.result === common.FieldResultEnum.String) {
      //       fraction = {
      //         // brick: `f'${stableFilter.filter}'`,
      //         brick: stableFilter.filter,
      //         operator: common.FractionOperatorEnum.Or,
      //         type: common.FractionTypeEnum.StringIsEqualTo,
      //         stringValue: stableFilter.filter
      //       };
      //     }

      //     if (common.isDefined(filtersFractions[fieldId])) {
      //       filtersFractions[fieldId].push(fraction);
      //     } else {
      //       filtersFractions[fieldId] = [fraction];
      //     }
      //   });

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

import { PostgresConnection } from '@malloydata/db-postgres';
import {
  ModelMaterializer,
  PreparedQuery,
  PreparedResult,
  QueryMaterializer,
  Runtime,
  malloyToQuery
} from '@malloydata/malloy';
import { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import {
  StringCondition,
  StringFilter,
  StringMatch
} from '@malloydata/malloy-filter';
import {
  LogMessage,
  Query as MalloyQuery,
  ModelEntryValueWithSource
} from '@malloydata/malloy-interfaces';
import {
  ExpressionWithFieldReference,
  FilterWithFilterString
} from '@malloydata/malloy-interfaces';
import { ASTQuery } from '@malloydata/malloy-query-builder';
import {
  ASTFilter,
  ASTFilterWithFilterString,
  ASTHavingViewOperation,
  ASTSegmentViewDefinition,
  ASTViewOperation,
  ASTWhereViewOperation,
  ParsedFilter
} from '@malloydata/malloy-query-builder';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

let func = common.FuncEnum.BuildMalloyQuery;

export async function buildMalloyQuery(
  item: {
    apiModel: common.Model;
    malloyConnections: PostgresConnection[];
    malloyModelDef: MalloyModelDef;
    malloyQuery: string;
    malloyEntryValueWithSource: ModelEntryValueWithSource;
    // errors: BmError[];
    // structId: string;
    // caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let {
    apiModel,
    malloyModelDef,
    malloyQuery
    // errors,
    // structId,
    // caller,
  } = item;
  // helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let startLoadModel = Date.now();
  let runtime = new Runtime({
    urlReader: {
      readURL: async (url: URL) => await fse.readFile(url, 'utf8')
    },
    connections: {
      lookupConnection: async function (name: string) {
        return item.malloyConnections.find(mc => mc.name === name);
      }
    }
  });

  let mm: ModelMaterializer = runtime._loadModelFromModelDef(malloyModelDef);
  // console.log('LoadModel');
  // console.log(Date.now() - startLoadModel); // 0ms

  let startLoadQuery = Date.now();
  let qm: QueryMaterializer = mm.loadQuery(malloyQuery); // 0 ms
  // console.log('LoadQuery');
  // console.log(Date.now() - startLoadQuery); // 0ms

  // let startGetSQL = Date.now();
  // let aSql = await qm.getSQL();
  // console.log('GetSQL');
  // console.log(Date.now() - startGetSQL); // 14ms

  let startPrepareQuery = Date.now();
  let preparedQuery: PreparedQuery = await qm.getPreparedQuery();
  // console.log('PrepareQuery');
  // console.log(Date.now() - startPrepareQuery); // 15ms (47ms if many where)

  let startPrepareResult = Date.now();
  let preparedResult: PreparedResult = preparedQuery.getPreparedResult();
  // console.log('PrepareResult');
  // console.log(Date.now() - startPrepareResult); // 10ms

  let startMalloyToQuery = Date.now();
  let malloyToQueryResult = malloyToQuery(item.malloyQuery);
  // console.log('MalloyToQuery');
  // console.log(Date.now() - startMalloyToQuery); // 15ms

  let logs: LogMessage[] = malloyToQueryResult?.logs;
  let q1: MalloyQuery = malloyToQueryResult?.query;

  let startASTQuery = Date.now();
  let astQuery: ASTQuery = new ASTQuery({
    source: item.malloyEntryValueWithSource,
    query: q1
  });
  // console.log('ASTQuery');
  // console.log(Date.now() - startASTQuery); // 1 ms

  let startFractions = Date.now();

  let filtersFractions: {
    [s: string]: common.Fraction[];
  } = {};

  let segment0: ASTSegmentViewDefinition = astQuery.getOrAddDefaultSegment();

  segment0.operations.items
    .filter(
      (operation: ASTViewOperation) =>
        operation instanceof ASTWhereViewOperation ||
        operation instanceof ASTHavingViewOperation
    )
    .map((op: ASTWhereViewOperation | ASTHavingViewOperation) => {
      // console.log('op');
      // console.dir(op, { depth: null });

      let astFilter: ASTFilter = op.filter;

      let parsedFilter: ParsedFilter = (
        astFilter as ASTFilterWithFilterString
      ).getFilter();

      // console.log('parsedFilter');
      // console.dir(parsedFilter, { depth: null });

      // { kind: 'string', parsed: { operator: '=', values: [ 'TX' ] } }
      // { kind: 'string', parsed: { operator: '=', values: [ 'OH', 'NY' ] } }
      // {
      //   kind: 'string',
      //   parsed: { operator: '=', values: [ 'NC', 'ND' ], not: true }
      // }
      // {
      //   kind: 'string',
      //   parsed: {
      //     operator: ',',
      //     members: [
      //       { operator: '=', values: [ 'UT' ] },
      //       { operator: 'starts', values: [ 'MT' ] }
      //     ]
      //   }
      // }
      // { kind: 'string', parsed: null }

      let exp = op.node.filter.expression as ExpressionWithFieldReference;

      let fieldId = common.isDefined(exp.path)
        ? [...exp.path, exp.name].join('.')
        : exp.name;

      let field = apiModel.fields.find(k => k.id === fieldId);

      let fraction: common.Fraction;

      if (
        field.result === common.FieldResultEnum.String &&
        parsedFilter.kind === 'string'
      ) {
        let stringFilters: StringFilter[] = [];

        if (parsedFilter?.parsed?.operator === ',') {
          stringFilters = parsedFilter.parsed.members;
        } else if (common.isDefined(parsedFilter)) {
          stringFilters = [parsedFilter.parsed];
        } else {
          stringFilters = [null];
        }

        stringFilters.forEach(stringFilter => {
          let eValues = [];

          if (common.isUndefined(stringFilter)) {
            eValues = [null];
          } else {
            let values = (stringFilter as StringCondition).values ?? [];

            let escapedValues =
              (stringFilter as StringMatch).escaped_values ?? [];

            eValues = [...values.map(v => escape(v)), ...escapedValues];
          }

          eValues.forEach(eValue => {
            let fractionOperator =
              (stringFilter as { not: boolean })?.not === true
                ? common.FractionOperatorEnum.And
                : common.FractionOperatorEnum.Or;

            fraction = {
              brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type: common.isUndefined(eValue)
                ? common.FractionTypeEnum.StringIsAnyValue
                : stringFilter.operator === '~'
                  ? fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.StringIsLike
                    : common.FractionTypeEnum.StringIsNotLike
                  : stringFilter.operator === '='
                    ? fractionOperator === common.FractionOperatorEnum.Or
                      ? common.FractionTypeEnum.StringIsEqualTo
                      : common.FractionTypeEnum.StringIsNotEqualTo
                    : stringFilter.operator === 'contains'
                      ? fractionOperator === common.FractionOperatorEnum.Or
                        ? common.FractionTypeEnum.StringContains
                        : common.FractionTypeEnum.StringDoesNotContain
                      : stringFilter.operator === 'starts'
                        ? fractionOperator === common.FractionOperatorEnum.Or
                          ? common.FractionTypeEnum.StringStartsWith
                          : common.FractionTypeEnum.StringDoesNotStartWith
                        : stringFilter.operator === 'ends'
                          ? fractionOperator === common.FractionOperatorEnum.Or
                            ? common.FractionTypeEnum.StringEndsWith
                            : common.FractionTypeEnum.StringDoesNotEndWith
                          : stringFilter.operator === 'empty'
                            ? common.FractionOperatorEnum.Or
                              ? common.FractionTypeEnum.StringIsBlank
                              : common.FractionTypeEnum.StringIsNotBlank
                            : stringFilter.operator === 'null'
                              ? common.FractionOperatorEnum.Or
                                ? common.FractionTypeEnum.StringIsNull
                                : common.FractionTypeEnum.StringIsNotNull
                              : undefined,
              stringValue: common.isDefined(eValue) ? eValue : undefined
            };

            if (common.isDefined(filtersFractions[fieldId])) {
              filtersFractions[fieldId].push(fraction);
            } else {
              filtersFractions[fieldId] = [fraction];
            }
          });
        });
      }

      return op.filter;
    });

  // console.log('Fractions');
  // console.log(Date.now() - startFractions); // 3ms

  console.log('filtersFractions');
  console.log(filtersFractions);

  return {
    // astQuery: astQuery,
    // preparedQuery: preparedQuery,
    preparedResult: preparedResult,
    filtersFractions: filtersFractions
  };
}

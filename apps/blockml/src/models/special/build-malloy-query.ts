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
  Null,
  NumberCondition,
  NumberFilter,
  NumberRange,
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
      console.dir(parsedFilter, { depth: null });

      let exp = op.node.filter.expression as ExpressionWithFieldReference;

      let fieldId = common.isDefined(exp.path)
        ? [...exp.path, exp.name].join('.')
        : exp.name;

      let field = apiModel.fields.find(k => k.id === fieldId);

      if (
        field.result === common.FieldResultEnum.String &&
        parsedFilter.kind === 'string'
      ) {
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

            let fraction: common.Fraction = {
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
      } else if (
        field.result === common.FieldResultEnum.Boolean &&
        parsedFilter.kind === 'boolean'
      ) {
        // { kind: 'boolean', parsed: null }
        // { kind: 'boolean', parsed: { operator: 'true' } }
        // { kind: 'boolean', parsed: { operator: 'false_or_null' } }
        // { kind: 'boolean', parsed: { operator: 'false' } }
        // { kind: 'boolean', parsed: { operator: 'null' } }
        // { kind: 'boolean', parsed: { operator: 'true', not: true } }
        // { kind: 'boolean', parsed: { operator: 'false_or_null', not: true } }
        // { kind: 'boolean', parsed: { operator: 'false', not: true } }
        // { kind: 'boolean', parsed: { operator: 'null', not: true } }

        // let booleanFilters: BooleanFilter[] = [];
        // if (parsedFilter?.parsed?.operator === ',') {
        //   stringFilters = parsedFilter.parsed.members;
        // } else
        let booleanFilter;

        if (common.isDefined(parsedFilter)) {
          booleanFilter = parsedFilter.parsed;
        } else {
          booleanFilter = null;
        }

        let fractionOperator =
          (booleanFilter as { not: boolean })?.not === true
            ? common.FractionOperatorEnum.And
            : common.FractionOperatorEnum.Or;

        let fraction: common.Fraction = {
          brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
          operator: fractionOperator,
          type: common.isUndefined(booleanFilter)
            ? common.FractionTypeEnum.BooleanIsAnyValue
            : booleanFilter.operator === 'true'
              ? fractionOperator === common.FractionOperatorEnum.Or
                ? common.FractionTypeEnum.BooleanIsTrue
                : common.FractionTypeEnum.BooleanIsNotTrue
              : booleanFilter.operator === 'false'
                ? fractionOperator === common.FractionOperatorEnum.Or
                  ? common.FractionTypeEnum.BooleanIsFalse
                  : common.FractionTypeEnum.BooleanIsNotFalse
                : booleanFilter.operator === 'false_or_null'
                  ? fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.BooleanIsFalseOrNull
                    : common.FractionTypeEnum.BooleanIsNotFalseOrNull
                  : booleanFilter.operator === 'null'
                    ? fractionOperator === common.FractionOperatorEnum.Or
                      ? common.FractionTypeEnum.BooleanIsNull
                      : common.FractionTypeEnum.BooleanIsNotNull
                    : undefined
        };

        if (common.isDefined(filtersFractions[fieldId])) {
          filtersFractions[fieldId].push(fraction);
        } else {
          filtersFractions[fieldId] = [fraction];
        }
      } else if (
        field.result === common.FieldResultEnum.Number &&
        parsedFilter.kind === 'number'
      ) {
        // { kind: 'number', parsed: null }
        // { kind: 'number', parsed: { operator: '=', values: [ '1' ] } }
        // { kind: 'number', parsed: { operator: '<=', values: [ '2' ] } }
        // { kind: 'number', parsed: { operator: '>=', values: [ '3' ] } }
        // { kind: 'number', parsed: { operator: '<', values: [ '4' ] } }
        // { kind: 'number', parsed: { operator: '>', values: [ '5' ] } }
        // { kind: 'number', parsed: { operator: 'null' } }
        // {
        //   kind: 'number',
        //   parsed: {
        //     operator: 'range',
        //     startValue: '6',
        //     startOperator: '>',
        //     endValue: '7',
        //     endOperator: '<'
        //   }
        // }
        // {
        //   kind: 'number',
        //   parsed: {
        //     operator: 'range',
        //     startValue: '8',
        //     startOperator: '>',
        //     endValue: '9',
        //     endOperator: '<='
        //   }
        // }
        // {
        //   kind: 'number',
        //   parsed: {
        //     operator: 'range',
        //     startValue: '10',
        //     startOperator: '>=',
        //     endValue: '11',
        //     endOperator: '<'
        //   }
        // }
        // {
        //   kind: 'number',
        //   parsed: {
        //     operator: 'range',
        //     startValue: '12',
        //     startOperator: '>=',
        //     endValue: '13',
        //     endOperator: '<='
        //   }
        // }
        // { kind: 'number', parsed: { operator: '=', values: [ '14', '15' ] } }
        // {
        //   kind: 'number',
        //   parsed: {
        //     operator: 'or',
        //     members: [
        //       { operator: '=', values: [ '16', '17', '18' ] },
        //       { operator: '<', values: [ '19' ] }
        //     ]
        //   }
        // }
        // { kind: 'number', parsed: { operator: '!=', values: [ '20' ] } }
        // { kind: 'number', parsed: { operator: '!=', values: [ '1' ] } }
        // {
        //   kind: 'number',
        //   parsed: { operator: '<=', values: [ '2' ], not: true }
        // }
        // {
        //   kind: 'number',
        //   parsed: { operator: '>=', values: [ '3' ], not: true }
        // }
        // {
        //   kind: 'number',
        //   parsed: { operator: '<', values: [ '4' ], not: true }
        // }
        // {
        //   kind: 'number',
        //   parsed: { operator: '>', values: [ '5' ], not: true }
        // }
        // { kind: 'number', parsed: { operator: 'null', not: true } }
        // {
        //   kind: 'number',
        //   parsed: {
        //     operator: 'range',
        //     startValue: '6',
        //     startOperator: '>',
        //     endValue: '7',
        //     endOperator: '<',
        //     not: true
        //   }
        // }
        // {
        //   kind: 'number',
        //   parsed: {
        //     operator: 'range',
        //     startValue: '8',
        //     startOperator: '>',
        //     endValue: '9',
        //     endOperator: '<=',
        //     not: true
        //   }
        // }
        // {
        //   kind: 'number',
        //   parsed: {
        //     operator: 'range',
        //     startValue: '10',
        //     startOperator: '>=',
        //     endValue: '11',
        //     endOperator: '<',
        //     not: true
        //   }
        // }
        // {
        //   kind: 'number',
        //   parsed: {
        //     operator: 'range',
        //     startValue: '12',
        //     startOperator: '>=',
        //     endValue: '13',
        //     endOperator: '<=',
        //     not: true
        //   }
        // }
        // { kind: 'number', parsed: { operator: '!=', values: [ '14', '15' ] } }
        // {
        //   kind: 'number',
        //   parsed: {
        //     operator: 'and',
        //     members: [
        //       { operator: '!=', values: [ '16' ] },
        //       { operator: '!=', values: [ '17', '18' ] },
        //       { operator: '<', values: [ '19' ], not: true }
        //     ]
        //   }
        // }
        // { kind: 'number', parsed: { operator: '=', values: [ '20' ] } }

        let numberFilters: NumberFilter[] = [];

        if (
          parsedFilter?.parsed?.operator === 'or' ||
          parsedFilter?.parsed?.operator === 'and'
        ) {
          numberFilters = parsedFilter.parsed.members;
        } else if (common.isDefined(parsedFilter.parsed)) {
          numberFilters = [parsedFilter.parsed];
        } else {
          // any
          let fraction: common.Fraction = {
            brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.NumberIsAnyValue
          };

          if (common.isDefined(filtersFractions[fieldId])) {
            filtersFractions[fieldId].push(fraction);
          } else {
            filtersFractions[fieldId] = [fraction];
          }
        }

        numberFilters.forEach(numberFilter => {
          let range: NumberRange =
            (numberFilter as NumberRange)?.operator === 'range'
              ? (numberFilter as NumberRange)
              : undefined;

          if (common.isDefined(range)) {
            // range
            let fractionOperator =
              (numberFilter as { not: boolean })?.not === true
                ? common.FractionOperatorEnum.And
                : common.FractionOperatorEnum.Or;

            let fraction: common.Fraction = {
              brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type:
                fractionOperator === common.FractionOperatorEnum.Or
                  ? common.FractionTypeEnum.NumberIsBetween
                  : common.FractionTypeEnum.NumberIsNotBetween,
              numberValue1: Number(range.startValue),
              numberValue2: Number(range.endValue),
              numberBetweenOption:
                range.startOperator === '>=' && range.endOperator === '<='
                  ? common.FractionNumberBetweenOptionEnum.Inclusive
                  : range.startOperator === '>' && range.endOperator === '<'
                    ? common.FractionNumberBetweenOptionEnum.Exclusive
                    : range.startOperator === '>=' && range.endOperator === '<'
                      ? common.FractionNumberBetweenOptionEnum.LeftInclusive
                      : range.startOperator === '>' &&
                          range.endOperator === '<='
                        ? common.FractionNumberBetweenOptionEnum.RightInclusive
                        : undefined
            };

            if (common.isDefined(filtersFractions[fieldId])) {
              filtersFractions[fieldId].push(fraction);
            } else {
              filtersFractions[fieldId] = [fraction];
            }
          } else if ((numberFilter as Null).operator === 'null') {
            // null
            let fractionOperator =
              (numberFilter as { not: boolean })?.not === true
                ? common.FractionOperatorEnum.And
                : common.FractionOperatorEnum.Or;

            let fraction: common.Fraction = {
              brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type:
                fractionOperator === common.FractionOperatorEnum.Or
                  ? common.FractionTypeEnum.NumberIsNull
                  : common.FractionTypeEnum.NumberIsNotNull
            };

            if (common.isDefined(filtersFractions[fieldId])) {
              filtersFractions[fieldId].push(fraction);
            } else {
              filtersFractions[fieldId] = [fraction];
            }
          } else if (
            ['=', '!=', '<=', '>=', '<', '>'].indexOf(
              (numberFilter as NumberCondition).operator
            ) > -1
          ) {
            // values
            let fractionOperator =
              (numberFilter as { not: boolean })?.not === true ||
              numberFilter.operator === '!='
                ? common.FractionOperatorEnum.And
                : common.FractionOperatorEnum.Or;

            let fraction: common.Fraction = {
              brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type:
                numberFilter.operator === '='
                  ? fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.NumberIsEqualTo
                    : common.FractionTypeEnum.NumberIsNotEqualTo
                  : numberFilter.operator === '!='
                    ? fractionOperator === common.FractionOperatorEnum.Or
                      ? common.FractionTypeEnum.NumberIsEqualTo // not possible
                      : common.FractionTypeEnum.NumberIsNotEqualTo
                    : numberFilter.operator === '<='
                      ? fractionOperator === common.FractionOperatorEnum.Or
                        ? common.FractionTypeEnum.NumberIsLessThanOrEqualTo
                        : common.FractionTypeEnum.NumberIsNotLessThanOrEqualTo
                      : numberFilter.operator === '>='
                        ? fractionOperator === common.FractionOperatorEnum.Or
                          ? common.FractionTypeEnum.NumberIsGreaterThanOrEqualTo
                          : common.FractionTypeEnum
                              .NumberIsNotGreaterThanOrEqualTo
                        : numberFilter.operator === '<'
                          ? fractionOperator === common.FractionOperatorEnum.Or
                            ? common.FractionTypeEnum.NumberIsLessThan
                            : common.FractionTypeEnum.NumberIsNotLessThan
                          : numberFilter.operator === '>'
                            ? fractionOperator ===
                              common.FractionOperatorEnum.Or
                              ? common.FractionTypeEnum.NumberIsGreaterThan
                              : common.FractionTypeEnum.NumberIsNotGreaterThan
                            : numberFilter.operator === 'null'
                              ? fractionOperator ===
                                common.FractionOperatorEnum.Or
                                ? common.FractionTypeEnum.NumberIsNull
                                : common.FractionTypeEnum.NumberIsNotNull
                              : undefined,
              numberValues: (numberFilter as NumberCondition).values.join(', ')
            };

            if (common.isDefined(filtersFractions[fieldId])) {
              filtersFractions[fieldId].push(fraction);
            } else {
              filtersFractions[fieldId] = [fraction];
            }
          }
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

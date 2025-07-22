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
  Before,
  BooleanFilter,
  JustUnits,
  Null,
  NumberCondition,
  NumberFilter,
  NumberRange,
  StringCondition,
  StringFilter,
  StringMatch,
  TemporalFilter,
  in_last
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

// packages/malloy-filter/src/clause_utils.ts

// export function malloyUnescape(str: string) {
//   return str.replace(/\\(.)/g, '$1');
// }

export function malloyEscape(str: string) {
  const lstr = str.toLowerCase();
  if (lstr === 'null' || lstr === 'empty') {
    return '\\' + str;
  }
  return str.replace(/([,; |()\\%_-])/g, '\\$1');
}

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

  let parsedFilters: ParsedFilter[] = []; // for logs

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

      parsedFilters.push(parsedFilter); // for logs

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
        let stringFilters: StringFilter[] = [];

        if (parsedFilter.parsed?.operator === ',') {
          stringFilters = parsedFilter.parsed.members;
        } else if (common.isDefined(parsedFilter.parsed)) {
          stringFilters = [parsedFilter.parsed];
        } else {
          // string any
          let fraction: common.Fraction = {
            brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.StringIsAnyValue
          };

          if (common.isDefined(filtersFractions[fieldId])) {
            filtersFractions[fieldId].push(fraction);
          } else {
            filtersFractions[fieldId] = [fraction];
          }
        }

        stringFilters.forEach(stringFilter => {
          if ((stringFilter as Null).operator === 'null') {
            // string null
            let fractionOperator =
              (stringFilter as { not: boolean })?.not === true
                ? common.FractionOperatorEnum.And
                : common.FractionOperatorEnum.Or;

            let fraction: common.Fraction = {
              brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type:
                fractionOperator === common.FractionOperatorEnum.Or
                  ? common.FractionTypeEnum.StringIsNull
                  : common.FractionTypeEnum.StringIsNotNull
            };

            if (common.isDefined(filtersFractions[fieldId])) {
              filtersFractions[fieldId].push(fraction);
            } else {
              filtersFractions[fieldId] = [fraction];
            }
          } else if (
            ['~', '=', 'contains', 'starts', 'ends', 'empty'].indexOf(
              stringFilter.operator
            ) > -1
          ) {
            // string main
            let values = (stringFilter as StringCondition).values ?? [];

            let escapedValues =
              (stringFilter as StringMatch).escaped_values ?? [];

            let eValues = [
              ...values.map(v => malloyEscape(v)),
              ...escapedValues
            ];

            eValues.forEach(eValue => {
              let fractionOperator =
                (stringFilter as { not: boolean })?.not === true
                  ? common.FractionOperatorEnum.And
                  : common.FractionOperatorEnum.Or;

              let fraction: common.Fraction = {
                brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  stringFilter.operator === '~'
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
                            ? fractionOperator ===
                              common.FractionOperatorEnum.Or
                              ? common.FractionTypeEnum.StringEndsWith
                              : common.FractionTypeEnum.StringDoesNotEndWith
                            : stringFilter.operator === 'empty'
                              ? common.FractionOperatorEnum.Or
                                ? common.FractionTypeEnum.StringIsBlank
                                : common.FractionTypeEnum.StringIsNotBlank
                              : undefined,
                stringValue: eValue
              };

              if (common.isDefined(filtersFractions[fieldId])) {
                filtersFractions[fieldId].push(fraction);
              } else {
                filtersFractions[fieldId] = [fraction];
              }
            });
          }
        });
      } else if (
        field.result === common.FieldResultEnum.Boolean &&
        parsedFilter.kind === 'boolean'
      ) {
        let booleanFilters: BooleanFilter[] = [];

        if (common.isDefined(parsedFilter.parsed)) {
          booleanFilters = [parsedFilter.parsed];
        } else {
          // boolean any
          let fraction: common.Fraction = {
            brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.BooleanIsAnyValue
          };

          if (common.isDefined(filtersFractions[fieldId])) {
            filtersFractions[fieldId].push(fraction);
          } else {
            filtersFractions[fieldId] = [fraction];
          }
        }

        booleanFilters.forEach(booleanFilter => {
          if ((booleanFilter as Null).operator === 'null') {
            // boolean null
            let fractionOperator =
              (booleanFilter as { not: boolean })?.not === true
                ? common.FractionOperatorEnum.And
                : common.FractionOperatorEnum.Or;

            let fraction: common.Fraction = {
              brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type:
                fractionOperator === common.FractionOperatorEnum.Or
                  ? common.FractionTypeEnum.BooleanIsNull
                  : common.FractionTypeEnum.BooleanIsNotNull
            };

            if (common.isDefined(filtersFractions[fieldId])) {
              filtersFractions[fieldId].push(fraction);
            } else {
              filtersFractions[fieldId] = [fraction];
            }
          } else if (
            ['true', 'false', 'false_or_null'].indexOf(booleanFilter.operator) >
            -1
          ) {
            // boolean main
            let fractionOperator =
              (booleanFilter as { not: boolean })?.not === true
                ? common.FractionOperatorEnum.And
                : common.FractionOperatorEnum.Or;

            let fraction: common.Fraction = {
              brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type:
                booleanFilter.operator === 'true'
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
                      : undefined
            };

            if (common.isDefined(filtersFractions[fieldId])) {
              filtersFractions[fieldId].push(fraction);
            } else {
              filtersFractions[fieldId] = [fraction];
            }
          }
        });
      } else if (
        field.result === common.FieldResultEnum.Number &&
        parsedFilter.kind === 'number'
      ) {
        let numberFilters: NumberFilter[] = [];

        if (
          parsedFilter.parsed?.operator === 'or' ||
          parsedFilter.parsed?.operator === 'and'
        ) {
          numberFilters = parsedFilter.parsed.members;
        } else if (common.isDefined(parsedFilter.parsed)) {
          numberFilters = [parsedFilter.parsed];
        } else {
          // number any
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
            // number range
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
            // number null
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
            ['=', '!=', '<=', '>=', '<', '>'].indexOf(numberFilter.operator) >
            -1
          ) {
            // number main
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
      } else if (
        [common.FieldResultEnum.Ts, common.FieldResultEnum.Date].indexOf(
          field.result
        ) > -1 &&
        (parsedFilter.kind === 'timestamp' || parsedFilter.kind === 'date')
      ) {
        // {value: 'in_last', label: 'last'},
        // {value: 'last', label: 'last complete'},
        // {value: 'next', label: 'next complete'},
        // {value: '-before', label: 'starting'},
        // {value: 'after', label: 'after'},
        // {value: 'before', label: 'before'},
        // {value: '-after', label: 'through'},
        // {value: 'in', label: 'is'},
        // {value: 'to', label: 'between'},
        // {value: 'null', label: 'null'},
        // {value: '-null', label: 'not null'},

        // is in last
        // is in range
        // is on Year
        // is on Month
        // is on Day
        // is on Hour
        // is on Minute
        // is before
        // is after
        // is before (relative)
        // is after (relative)
        // is any value
        // is null
        // is not null

        let temporalFilters: TemporalFilter[] = [];

        if (
          parsedFilter.parsed?.operator === 'or' ||
          parsedFilter.parsed?.operator === 'and'
        ) {
          temporalFilters = parsedFilter.parsed.members;
        } else if (common.isDefined(parsedFilter.parsed)) {
          temporalFilters = [parsedFilter.parsed];
        } else {
          // temporal any
          let fraction: common.Fraction = {
            brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
            operator: common.FractionOperatorEnum.Or,
            type: common.FractionTypeEnum.TsIsAnyValue
          };

          if (common.isDefined(filtersFractions[fieldId])) {
            filtersFractions[fieldId].push(fraction);
          } else {
            filtersFractions[fieldId] = [fraction];
          }
        }

        // export type TemporalFilter = Null | Before | After | To | For | JustUnits | in_last | InMoment | BooleanChain<TemporalFilter> | ClauseGroup<TemporalFilter>;
        temporalFilters
          .filter(
            temporalFilter =>
              [
                'null',
                'last',
                'in_last',
                'next',
                'in',
                'for',
                'before',
                'after',
                'to'
              ].indexOf(temporalFilter.operator) > -1
          )
          .forEach(temporalFilter => {
            // temporal main

            let fractionOperator =
              (temporalFilter as { not: boolean })?.not === true
                ? common.FractionOperatorEnum.And
                : common.FractionOperatorEnum.Or;

            let fraction: common.Fraction;

            if ((temporalFilter as Null).operator === 'null') {
              // temporal null
              fraction = {
                brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.NumberIsNull
                    : common.FractionTypeEnum.NumberIsNotNull
              };
            } else if ((temporalFilter as JustUnits).operator === 'last') {
              // temporal last (complete)
              let tFilter = temporalFilter as JustUnits;

              fraction = {
                brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.TsIsInLast
                    : common.FractionTypeEnum.TsIsNotInLast,
                tsLastValue: Number(tFilter.n),
                tsLastUnit: common.getFractionTsLastUnits(tFilter.units),
                tsLastCompleteOption:
                  common.FractionTsLastCompleteOptionEnum.Complete
              };
            } else if ((temporalFilter as in_last).operator === 'in_last') {
              // temporal in_last (incomplete)
              let tFilter = temporalFilter as in_last;

              fraction = {
                brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.TsIsInLast
                    : common.FractionTypeEnum.TsIsNotInLast,
                tsLastValue: Number(tFilter.n),
                tsLastUnit: common.getFractionTsLastUnits(tFilter.units),
                tsLastCompleteOption:
                  common.FractionTsLastCompleteOptionEnum.Incomplete
              };
            } else if ((temporalFilter as JustUnits).operator === 'next') {
              // temporal next (complete)
              let tFilter = temporalFilter as JustUnits;

              fraction = {
                brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.TsIsInNext
                    : common.FractionTypeEnum.TsIsNotInNext,
                tsLastValue: Number(tFilter.n),
                tsLastUnit: common.getFractionTsLastUnits(tFilter.units),
                tsLastCompleteOption:
                  common.FractionTsLastCompleteOptionEnum.Complete
              };
            } else if ((temporalFilter as Before).operator === 'before') {
              // temporal before
              let tFilter = temporalFilter as Before;

              fraction = {
                brick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.TsIsBeforeDate
                    : common.FractionTypeEnum.TsIsNotBeforeDate

                // tsDateYear: Number(year),
                // tsDateMonth: Number(month),
                // tsDateDay: Number(day),
                // tsDateHour: Number(hour),
                // tsDateMinute: Number(minute),

                // tsForOption: forUnit
                //   ? common.FractionTsForOptionEnum.For
                //   : common.FractionTsForOptionEnum.ForInfinity,
                // tsForValue: Number(forIntegerStr),
                // tsForUnit: <any>forUnit
              };
            }

            if (common.isDefined(fraction)) {
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

  // fse.writeFileSync(
  //   `filters-fractions.json`,
  //   JSON.stringify(filtersFractions, null, 2),
  //   'utf-8'
  // );

  // fse.writeFileSync(
  //   `parsed-filters.json`,
  //   JSON.stringify(parsedFilters, null, 2),
  //   'utf-8'
  // );

  console.log('filtersFractions');
  console.log(filtersFractions);

  return {
    // astQuery: astQuery,
    // preparedQuery: preparedQuery,
    preparedResult: preparedResult,
    filtersFractions: filtersFractions
  };
}

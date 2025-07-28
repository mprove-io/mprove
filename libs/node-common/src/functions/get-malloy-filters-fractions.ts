import {
  After,
  Before,
  BooleanFilter,
  For,
  InMoment,
  JustUnits,
  NowMoment,
  Null,
  NumberCondition,
  NumberFilter,
  NumberRange,
  StringCondition,
  StringEmpty,
  StringFilter,
  StringMatch,
  TemporalFilter,
  TemporalLiteral,
  To,
  WeekdayMoment,
  WhichdayMoment,
  in_last
} from '@malloydata/malloy-filter';
import {
  ExpressionWithFieldReference,
  FilterWithFilterString
} from '@malloydata/malloy-interfaces';
import {
  ASTFilter,
  ASTFilterWithFilterString,
  ASTHavingViewOperation,
  ASTSegmentViewDefinition,
  ASTViewOperation,
  ASTWhereViewOperation,
  ParsedFilter
} from '@malloydata/malloy-query-builder';
import { MALLOY_FILTER_ANY } from '~common/_index';
import { common } from '~node-common/barrels/common';
import { getMalloyMomentStr } from './get-malloy-moment-str';

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

export function getMalloyFiltersFractions(item: {
  segment: ASTSegmentViewDefinition;
  apiModel: common.Model;
}) {
  let { segment, apiModel } = item;

  let filtersFractions: {
    [s: string]: common.Fraction[];
  } = {};

  let parsedFilters: ParsedFilter[] = []; // for logs

  segment.operations.items
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
      // console.dir(parsedFilter, { depth: null });

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
            brick: MALLOY_FILTER_ANY,
            parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
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
              brick:
                fractionOperator === common.FractionOperatorEnum.Or
                  ? 'f`null`'
                  : 'f`-null`',
              parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
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
          } else if ((stringFilter as StringEmpty).operator === 'empty') {
            // string empty
            let fractionOperator =
              (stringFilter as { not: boolean })?.not === true
                ? common.FractionOperatorEnum.And
                : common.FractionOperatorEnum.Or;

            let fraction: common.Fraction = {
              brick:
                fractionOperator === common.FractionOperatorEnum.Or
                  ? 'f`empty`'
                  : 'f`-empty`',
              parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type:
                fractionOperator === common.FractionOperatorEnum.Or
                  ? common.FractionTypeEnum.StringIsEmpty
                  : common.FractionTypeEnum.StringIsNotEmpty
            };

            if (common.isDefined(filtersFractions[fieldId])) {
              filtersFractions[fieldId].push(fraction);
            } else {
              filtersFractions[fieldId] = [fraction];
            }
          } else if (
            ['~', '=', 'contains', 'starts', 'ends'].indexOf(
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
                brick:
                  stringFilter.operator === '~'
                    ? fractionOperator === common.FractionOperatorEnum.Or
                      ? `f\`${eValue}\``
                      : `f\`-${eValue}\``
                    : stringFilter.operator === '='
                      ? fractionOperator === common.FractionOperatorEnum.Or
                        ? `f\`${eValue}\``
                        : `f\`-${eValue}\``
                      : stringFilter.operator === 'contains'
                        ? fractionOperator === common.FractionOperatorEnum.Or
                          ? `f\`%${eValue}%\``
                          : `f\`-%${eValue}%\``
                        : stringFilter.operator === 'starts'
                          ? fractionOperator === common.FractionOperatorEnum.Or
                            ? `f\`${eValue}%\``
                            : `f\`-${eValue}%\``
                          : stringFilter.operator === 'ends'
                            ? fractionOperator ===
                              common.FractionOperatorEnum.Or
                              ? `f\`%${eValue}\``
                              : `f\`-%${eValue}\``
                            : undefined,
                parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
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
            brick: MALLOY_FILTER_ANY,
            parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
            operator: common.FractionOperatorEnum.And, // "And" isntead of "Or"
            type: common.FractionTypeEnum.BooleanIsAnyValue
          };

          if (common.isDefined(filtersFractions[fieldId])) {
            filtersFractions[fieldId].push(fraction);
          } else {
            filtersFractions[fieldId] = [fraction];
          }
        }

        booleanFilters.forEach(booleanFilter => {
          let fractionOperator =
            // (booleanFilter as { not: boolean })?.not === true
            //   ? common.FractionOperatorEnum.And
            //   : common.FractionOperatorEnum.Or;
            common.FractionOperatorEnum.And;

          let isNot = (booleanFilter as { not: boolean })?.not === true;

          if ((booleanFilter as Null).operator === 'null') {
            // boolean null
            let fraction: common.Fraction = {
              brick: isNot === false ? 'f`null`' : 'f`not null`',
              parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type:
                isNot === false
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
            let fraction: common.Fraction = {
              brick:
                booleanFilter.operator === 'true'
                  ? isNot === false
                    ? 'f`true`'
                    : 'f`not true`'
                  : booleanFilter.operator === 'false'
                    ? isNot === false
                      ? 'f`=false`'
                      : 'f`not =false`'
                    : booleanFilter.operator === 'false_or_null'
                      ? isNot === false
                        ? 'f`false`'
                        : 'f`not false`'
                      : undefined,
              parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type:
                booleanFilter.operator === 'true'
                  ? isNot === false
                    ? common.FractionTypeEnum.BooleanIsTrue
                    : common.FractionTypeEnum.BooleanIsNotTrue
                  : booleanFilter.operator === 'false'
                    ? isNot === false
                      ? common.FractionTypeEnum.BooleanIsFalse
                      : common.FractionTypeEnum.BooleanIsNotFalse
                    : booleanFilter.operator === 'false_or_null'
                      ? isNot === false
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
            brick: MALLOY_FILTER_ANY,
            parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
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
              brick:
                range.startOperator === '>=' && range.endOperator === '<='
                  ? fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`[${range.startValue} to ${range.endValue}]\``
                    : `f\`not [${range.startValue} to ${range.endValue}]\``
                  : range.startOperator === '>' && range.endOperator === '<'
                    ? fractionOperator === common.FractionOperatorEnum.Or
                      ? `f\`(${range.startValue} to ${range.endValue})\``
                      : `f\`not (${range.startValue} to ${range.endValue})\``
                    : range.startOperator === '>=' && range.endOperator === '<'
                      ? fractionOperator === common.FractionOperatorEnum.Or
                        ? `f\`[${range.startValue} to ${range.endValue})\``
                        : `f\`not [${range.startValue} to ${range.endValue})\``
                      : range.startOperator === '>' &&
                          range.endOperator === '<='
                        ? fractionOperator === common.FractionOperatorEnum.Or
                          ? `f\`(${range.startValue} to ${range.endValue}]\``
                          : `f\`not (${range.startValue} to ${range.endValue}]\``
                        : undefined,
              parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
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
              brick:
                fractionOperator === common.FractionOperatorEnum.Or
                  ? 'f`null`'
                  : 'f`not null`',
              parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
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

            let valuesStr = (numberFilter as NumberCondition).values.join(', '); // multiple values are expected only for '=' and '!=' operators

            let fraction: common.Fraction = {
              brick:
                numberFilter.operator === '='
                  ? fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`${valuesStr}\``
                    : `f\`not ${valuesStr}\`` // becomes !=
                  : numberFilter.operator === '!='
                    ? fractionOperator === common.FractionOperatorEnum.Or
                      ? `f\`!= ${valuesStr}\`` // not possible
                      : `f\`not ${valuesStr}\``
                    : numberFilter.operator === '<='
                      ? fractionOperator === common.FractionOperatorEnum.Or
                        ? `f\`<= ${valuesStr}\``
                        : `f\`not <= ${valuesStr}\``
                      : numberFilter.operator === '>='
                        ? fractionOperator === common.FractionOperatorEnum.Or
                          ? `f\`>= ${valuesStr}\``
                          : `f\`not >= ${valuesStr}\``
                        : numberFilter.operator === '<'
                          ? fractionOperator === common.FractionOperatorEnum.Or
                            ? `f\`< ${valuesStr}\``
                            : `f\`not < ${valuesStr}\``
                          : numberFilter.operator === '>'
                            ? fractionOperator ===
                              common.FractionOperatorEnum.Or
                              ? `f\`> ${valuesStr}\``
                              : `f\`not > ${valuesStr}\``
                            : undefined,
              parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
              operator: fractionOperator,
              type:
                numberFilter.operator === '='
                  ? fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.NumberIsEqualTo
                    : common.FractionTypeEnum.NumberIsNotEqualTo // becomes !=
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
              numberValues:
                ['=', '!='].indexOf(numberFilter.operator) > -1
                  ? valuesStr
                  : undefined,
              numberValue1:
                ['<=', '>=', '<', '>'].indexOf(numberFilter.operator) > -1
                  ? Number(valuesStr)
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

        // is in last (complete + current) (complete) (incomplete)
        // is in next (complete)
        // is between           literal     last, this, next          [from ... to ...]
        // is starting          literal     last, this, next          [not before]
        // is starting ... for  literal     last, this, next          [begin ... for ...]
        // is after             literal     last, this, next
        // is before            literal     last, this, next
        // is through           literal     last, this, next          [not after]
        // is on Year           literal     last, this, next
        // is on Quarter        literal     last, this, next
        // is on Month          literal     last, this, next
        // is on Week           literal     last, this, next
        // is on Day            literal     last (yesterday), this (today), next (tomorrow), last Sunday, next Sunday, ...
        // is on Hour           literal     last, this, next
        // is on Minute         literal     last, this, next
        // is on Timestamp      literal     now
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
            brick: MALLOY_FILTER_ANY,
            parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
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
                'before',
                'after',
                'to',
                'in',
                'for'
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
              // temporal null (null)
              fraction = {
                brick:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? 'f`null`'
                    : 'f`not null`',
                parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.TsIsNull
                    : common.FractionTypeEnum.TsIsNotNull
              };
            } else if ((temporalFilter as JustUnits).operator === 'last') {
              // temporal last (last complete)
              let tFilter = temporalFilter as JustUnits;

              fraction = {
                brick:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`last ${tFilter.n} ${tFilter.units}s\``
                    : `f\`not last ${tFilter.n} ${tFilter.units}s\``,
                parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
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
              // temporal in_last (last [incomplete])
              let tFilter = temporalFilter as in_last;

              fraction = {
                brick:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`${tFilter.n} ${tFilter.units}s\``
                    : `f\`not ${tFilter.n} ${tFilter.units}s\``,
                parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
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
              // temporal next (next complete)
              let tFilter = temporalFilter as JustUnits;

              fraction = {
                brick:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`next ${tFilter.n} ${tFilter.units}s\``
                    : `f\`not next ${tFilter.n} ${tFilter.units}s\``,
                parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.TsIsInNext
                    : common.FractionTypeEnum.TsIsNotInNext,
                tsNextValue: Number(tFilter.n),
                tsNextUnit: common.getFractionTsNextUnits(tFilter.units)
              };
            } else if ((temporalFilter as Before).operator === 'before') {
              // temporal before (before)
              let tFilter = temporalFilter as Before;
              let before = tFilter.before;

              let { year, quarter, month, day, hour, minute } =
                common.parseTsLiteral({
                  input: (before as TemporalLiteral).literal,
                  units: (before as TemporalLiteral).units
                });

              let m = getMalloyMomentStr(tFilter.before);

              fraction = {
                brick:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`before ${m.momentStr}\``
                    : `f\`starting ${m.momentStr}\``,
                parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.TsIsBeforeDate
                    : common.FractionTypeEnum.TsIsStarting,
                tsMomentType: m.momentType,
                tsMoment: before,
                tsDateYear: common.isDefined(year) ? Number(year) : undefined,
                tsDateQuarter: common.isDefined(quarter)
                  ? Number(quarter)
                  : undefined,
                tsDateMonth: common.isDefined(month)
                  ? Number(month)
                  : undefined,
                tsDateDay: common.isDefined(day) ? Number(day) : undefined,
                tsDateHour: common.isDefined(hour) ? Number(hour) : undefined,
                tsDateMinute: common.isDefined(minute)
                  ? Number(minute)
                  : undefined
              };
            } else if ((temporalFilter as After).operator === 'after') {
              // temporal after (after)
              let tFilter = temporalFilter as After;
              let after = tFilter.after;

              let { year, quarter, month, day, hour, minute } =
                common.parseTsLiteral({
                  input: (after as TemporalLiteral).literal,
                  units: (after as TemporalLiteral).units
                });

              let m = getMalloyMomentStr(tFilter.after);

              fraction = {
                brick:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`after ${m.momentStr}\``
                    : `f\`through ${m.momentStr}\``,
                parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.TsIsAfterDate
                    : common.FractionTypeEnum.TsIsThrough,
                tsMomentType: m.momentType,
                tsMoment: after,
                tsDateYear: common.isDefined(year) ? Number(year) : undefined,
                tsDateQuarter: common.isDefined(quarter)
                  ? Number(quarter)
                  : undefined,
                tsDateMonth: common.isDefined(month)
                  ? Number(month)
                  : undefined,
                tsDateDay: common.isDefined(day) ? Number(day) : undefined,
                tsDateHour: common.isDefined(hour) ? Number(hour) : undefined,
                tsDateMinute: common.isDefined(minute)
                  ? Number(minute)
                  : undefined
              };
            } else if ((temporalFilter as To).operator === 'to') {
              // temporal to (in range)
              let tFilter = temporalFilter as To;
              let from = tFilter.fromMoment;
              let to = tFilter.toMoment;

              let { year, quarter, month, day, hour, minute } =
                common.parseTsLiteral({
                  input: (from as TemporalLiteral).literal,
                  units: (from as TemporalLiteral).units
                });

              let {
                year: toYear,
                quarter: toQuarter,
                month: toMonth,
                day: toDay,
                hour: toHour,
                minute: toMinute
              } = common.parseTsLiteral({
                input: (to as TemporalLiteral).literal,
                units: (to as TemporalLiteral).units
              });

              let mFrom = getMalloyMomentStr(tFilter.fromMoment);
              let mTo = getMalloyMomentStr(tFilter.toMoment);

              fraction = {
                brick:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`${mFrom.momentStr} to ${mTo.momentStr}\``
                    : `f\`not ${mFrom.momentStr} to ${mTo.momentStr}\``,
                parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? tFilter.fromMoment.moment === 'ago' &&
                      tFilter.toMoment.moment === 'now'
                      ? common.FractionTypeEnum.TsIsInLast
                      : common.FractionTypeEnum.TsIsInRange
                    : tFilter.fromMoment.moment === 'ago' &&
                        tFilter.toMoment.moment === 'now'
                      ? common.FractionTypeEnum.TsIsNotInLast
                      : common.FractionTypeEnum.TsIsNotInRange,
                tsFromMomentType: mFrom.momentType,
                tsToMomentType: mTo.momentType,
                tsFromMoment: from,
                tsToMoment: to,
                tsLastValue:
                  tFilter.fromMoment.moment === 'ago' &&
                  tFilter.toMoment.moment === 'now'
                    ? Number(tFilter.fromMoment.n)
                    : undefined,
                tsLastUnit:
                  tFilter.fromMoment.moment === 'ago' &&
                  tFilter.toMoment.moment === 'now'
                    ? common.getFractionTsLastUnits(tFilter.fromMoment.units)
                    : undefined,
                tsLastCompleteOption:
                  mFrom.momentStr.endsWith('ago') && mTo.momentStr === 'now'
                    ? common.FractionTsLastCompleteOptionEnum
                        .CompletePlusCurrent
                    : undefined,
                tsDateYear: common.isDefined(year) ? Number(year) : undefined,
                tsDateQuarter: common.isDefined(quarter)
                  ? Number(quarter)
                  : undefined,
                tsDateMonth: common.isDefined(month)
                  ? Number(month)
                  : undefined,
                tsDateDay: common.isDefined(day) ? Number(day) : undefined,
                tsDateHour: common.isDefined(hour) ? Number(hour) : undefined,
                tsDateMinute: common.isDefined(minute)
                  ? Number(minute)
                  : undefined,
                tsDateToYear: common.isDefined(toYear)
                  ? Number(toYear)
                  : undefined,
                tsDateToQuarter: common.isDefined(toQuarter)
                  ? Number(toQuarter)
                  : undefined,
                tsDateToMonth: common.isDefined(toMonth)
                  ? Number(toMonth)
                  : undefined,
                tsDateToDay: common.isDefined(toDay)
                  ? Number(toDay)
                  : undefined,
                tsDateToHour: common.isDefined(toHour)
                  ? Number(toHour)
                  : undefined,
                tsDateToMinute: common.isDefined(toMinute)
                  ? Number(toMinute)
                  : undefined
              };
            } else if ((temporalFilter as InMoment).operator === 'in') {
              // temporal in (on)
              let tFilter = temporalFilter as InMoment;
              let tFilterIn = tFilter.in;

              let { year, quarter, month, day, hour, minute } =
                common.parseTsLiteral({
                  input: (tFilterIn as TemporalLiteral).literal,
                  units: (tFilterIn as TemporalLiteral).units
                });

              let m = getMalloyMomentStr(tFilter.in);

              fraction = {
                brick:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`${m.momentStr}\``
                    : `f\`not ${m.momentStr}\``,
                parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  (tFilterIn as TemporalLiteral).units === 'year'
                    ? common.FractionOperatorEnum.Or
                      ? common.FractionTypeEnum.TsIsOnYear
                      : common.FractionTypeEnum.TsIsNotOnYear
                    : (tFilterIn as TemporalLiteral).units === 'quarter'
                      ? common.FractionOperatorEnum.Or
                        ? common.FractionTypeEnum.TsIsOnQuarter
                        : common.FractionTypeEnum.TsIsNotOnQuarter
                      : (tFilterIn as TemporalLiteral).units === 'month'
                        ? common.FractionOperatorEnum.Or
                          ? common.FractionTypeEnum.TsIsOnMonth
                          : common.FractionTypeEnum.TsIsNotOnMonth
                        : (tFilterIn as TemporalLiteral).units === 'week'
                          ? common.FractionOperatorEnum.Or
                            ? common.FractionTypeEnum.TsIsOnWeek
                            : common.FractionTypeEnum.TsIsNotOnWeek
                          : (tFilterIn as TemporalLiteral).units === 'day' ||
                              ['today', 'yesterday', 'tomorrow'].indexOf(
                                (tFilter.in as WhichdayMoment).moment
                              ) > -1 ||
                              [
                                'sunday',
                                'monday',
                                'tuesday',
                                'wednesday',
                                'thursday',
                                'friday',
                                'saturday'
                              ].indexOf((tFilter.in as WeekdayMoment).moment) >
                                -1
                            ? common.FractionOperatorEnum.Or
                              ? common.FractionTypeEnum.TsIsOnDay
                              : common.FractionTypeEnum.TsIsNotOnDay
                            : (tFilterIn as TemporalLiteral).units === 'hour'
                              ? common.FractionOperatorEnum.Or
                                ? common.FractionTypeEnum.TsIsOnHour
                                : common.FractionTypeEnum.TsIsNotOnHour
                              : (tFilterIn as TemporalLiteral).units ===
                                  'minute'
                                ? common.FractionOperatorEnum.Or
                                  ? common.FractionTypeEnum.TsIsOnMinute
                                  : common.FractionTypeEnum.TsIsNotOnMinute
                                : tFilterIn.moment === 'literal' ||
                                    (tFilter.in as NowMoment).moment === 'now'
                                  ? common.FractionOperatorEnum.Or
                                    ? common.FractionTypeEnum.TsIsOnTimestamp
                                    : common.FractionTypeEnum.TsIsNotOnTimestamp
                                  : undefined,
                tsMomentType: m.momentType,
                tsMoment: tFilter.in,
                tsDateYear: common.isDefined(year) ? Number(year) : undefined,
                tsDateQuarter: common.isDefined(quarter)
                  ? Number(quarter)
                  : undefined,
                tsDateMonth: common.isDefined(month)
                  ? Number(month)
                  : undefined,
                tsDateDay: common.isDefined(day) ? Number(day) : undefined,
                tsDateHour: common.isDefined(hour) ? Number(hour) : undefined,
                tsDateMinute: common.isDefined(minute)
                  ? Number(minute)
                  : undefined
              };
            } else if ((temporalFilter as For).operator === 'for') {
              // temporal for (begin ... for ...) [starts ... for ...]
              let tFilter = temporalFilter as For;
              let begin = tFilter.begin;

              let { year, quarter, month, day, hour, minute } =
                common.parseTsLiteral({
                  input: (begin as TemporalLiteral).literal,
                  units: (begin as TemporalLiteral).units
                });

              let m = getMalloyMomentStr(tFilter.begin);

              fraction = {
                brick:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`${m.momentStr} for ${tFilter.n} ${tFilter.units}s\``
                    : `f\`not ${m.momentStr} for ${tFilter.n} ${tFilter.units}s\``,
                parentBrick: `f\`${(op.node.filter as FilterWithFilterString).filter}\``,
                operator: fractionOperator,
                type:
                  fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.TsIsBeginFor
                    : common.FractionTypeEnum.TsIsNotBeginFor,
                tsMomentType: m.momentType,
                tsMoment: begin,
                tsDateYear: common.isDefined(year) ? Number(year) : undefined,
                tsDateQuarter: common.isDefined(quarter)
                  ? Number(quarter)
                  : undefined,
                tsDateMonth: common.isDefined(month)
                  ? Number(month)
                  : undefined,
                tsDateDay: common.isDefined(day) ? Number(day) : undefined,
                tsDateHour: common.isDefined(hour) ? Number(hour) : undefined,
                tsDateMinute: common.isDefined(minute)
                  ? Number(minute)
                  : undefined,
                tsForOption: common.FractionTsForOptionEnum.For,
                tsForUnit: common.getFractionTsForUnits(tFilter.units),
                tsForValue: Number(tFilter.n)
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
  console.dir(filtersFractions, { depth: null });

  Object.keys(filtersFractions).forEach(key => {
    filtersFractions[key].forEach(fraction => {
      if (fraction.brick !== fraction.parentBrick) {
        console.log(fraction.parentBrick);
        console.log(fraction.brick);
      }
    });
  });

  return { filtersFractions: filtersFractions, parsedFilters: parsedFilters };
}

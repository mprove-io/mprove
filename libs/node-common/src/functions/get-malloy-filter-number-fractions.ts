import {
  Null,
  NumberCondition,
  NumberFilter,
  NumberRange
} from '@malloydata/malloy-filter';
import { MALLOY_FILTER_ANY } from '~common/_index';
import { common } from '~node-common/barrels/common';

export function getMalloyFilterNumberFractions(item: {
  parsed: NumberFilter;
  parentBrick: string;
}) {
  let { parsed, parentBrick } = item;

  let fractions: common.Fraction[] = [];

  let numberFilters: NumberFilter[] = [];

  if (parsed?.operator === 'or' || parsed?.operator === 'and') {
    // parsed is null for any
    numberFilters = parsed.members;
  } else if (common.isDefined(parsed)) {
    numberFilters = [parsed];
  } else {
    // number any
    let fraction: common.Fraction = {
      brick: MALLOY_FILTER_ANY,
      parentBrick: parentBrick,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.NumberIsAnyValue
    };

    fractions.push(fraction);
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
                : range.startOperator === '>' && range.endOperator === '<='
                  ? fractionOperator === common.FractionOperatorEnum.Or
                    ? `f\`(${range.startValue} to ${range.endValue}]\``
                    : `f\`not (${range.startValue} to ${range.endValue}]\``
                  : undefined,
        parentBrick: parentBrick,
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
                : range.startOperator === '>' && range.endOperator === '<='
                  ? common.FractionNumberBetweenOptionEnum.RightInclusive
                  : undefined
      };

      fractions.push(fraction);
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
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          fractionOperator === common.FractionOperatorEnum.Or
            ? common.FractionTypeEnum.NumberIsNull
            : common.FractionTypeEnum.NumberIsNotNull
      };

      fractions.push(fraction);
    } else if (
      ['=', '!=', '<=', '>=', '<', '>'].indexOf(numberFilter.operator) > -1
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
                      ? fractionOperator === common.FractionOperatorEnum.Or
                        ? `f\`> ${valuesStr}\``
                        : `f\`not > ${valuesStr}\``
                      : undefined,
        parentBrick: parentBrick,
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
                    : common.FractionTypeEnum.NumberIsNotGreaterThanOrEqualTo
                  : numberFilter.operator === '<'
                    ? fractionOperator === common.FractionOperatorEnum.Or
                      ? common.FractionTypeEnum.NumberIsLessThan
                      : common.FractionTypeEnum.NumberIsNotLessThan
                    : numberFilter.operator === '>'
                      ? fractionOperator === common.FractionOperatorEnum.Or
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

      fractions.push(fraction);
    }
  });

  return { fractions: fractions };
}

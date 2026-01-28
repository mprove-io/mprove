import {
  Null,
  NumberCondition,
  NumberFilter,
  NumberRange
} from '@malloydata/malloy-filter';
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { FractionNumberBetweenOptionEnum } from '#common/enums/fraction/fraction-number-between-option.enum';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { Fraction } from '#common/interfaces/blockml/fraction';

export function getMalloyFilterNumberFractions(item: {
  parsed: NumberFilter;
  parentBrick: string;
}) {
  let { parsed, parentBrick } = item;

  let fractions: Fraction[] = [];

  let numberFilters: NumberFilter[] = [];

  if (parsed?.operator === 'or' || parsed?.operator === 'and') {
    // parsed is null for any
    numberFilters = parsed.members;
  } else if (isDefined(parsed)) {
    numberFilters = [parsed];
  } else {
    // number any
    let fraction: Fraction = {
      brick: MALLOY_FILTER_ANY,
      parentBrick: parentBrick,
      operator: FractionOperatorEnum.Or,
      type: FractionTypeEnum.NumberIsAnyValue
    };

    fractions.push(fraction);
  }

  numberFilters.forEach(numberFilter => {
    let range: NumberRange =
      (numberFilter as NumberRange)?.operator === 'range'
        ? (numberFilter as NumberRange)
        : undefined;

    if (isDefined(range)) {
      // number range
      let fractionOperator =
        (numberFilter as { not: boolean })?.not === true
          ? FractionOperatorEnum.And
          : FractionOperatorEnum.Or;

      let fraction: Fraction = {
        brick:
          range.startOperator === '>=' && range.endOperator === '<='
            ? fractionOperator === FractionOperatorEnum.Or
              ? `f\`[${range.startValue} to ${range.endValue}]\``
              : `f\`not [${range.startValue} to ${range.endValue}]\``
            : range.startOperator === '>' && range.endOperator === '<'
              ? fractionOperator === FractionOperatorEnum.Or
                ? `f\`(${range.startValue} to ${range.endValue})\``
                : `f\`not (${range.startValue} to ${range.endValue})\``
              : range.startOperator === '>=' && range.endOperator === '<'
                ? fractionOperator === FractionOperatorEnum.Or
                  ? `f\`[${range.startValue} to ${range.endValue})\``
                  : `f\`not [${range.startValue} to ${range.endValue})\``
                : range.startOperator === '>' && range.endOperator === '<='
                  ? fractionOperator === FractionOperatorEnum.Or
                    ? `f\`(${range.startValue} to ${range.endValue}]\``
                    : `f\`not (${range.startValue} to ${range.endValue}]\``
                  : undefined,
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          fractionOperator === FractionOperatorEnum.Or
            ? FractionTypeEnum.NumberIsBetween
            : FractionTypeEnum.NumberIsNotBetween,
        numberValue1: Number(range.startValue),
        numberValue2: Number(range.endValue),
        numberBetweenOption:
          range.startOperator === '>=' && range.endOperator === '<='
            ? FractionNumberBetweenOptionEnum.Inclusive
            : range.startOperator === '>' && range.endOperator === '<'
              ? FractionNumberBetweenOptionEnum.Exclusive
              : range.startOperator === '>=' && range.endOperator === '<'
                ? FractionNumberBetweenOptionEnum.LeftInclusive
                : range.startOperator === '>' && range.endOperator === '<='
                  ? FractionNumberBetweenOptionEnum.RightInclusive
                  : undefined
      };

      fractions.push(fraction);
    } else if ((numberFilter as Null).operator === 'null') {
      // number null
      let fractionOperator =
        (numberFilter as { not: boolean })?.not === true
          ? FractionOperatorEnum.And
          : FractionOperatorEnum.Or;

      let fraction: Fraction = {
        brick:
          fractionOperator === FractionOperatorEnum.Or
            ? 'f`null`'
            : 'f`not null`',
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          fractionOperator === FractionOperatorEnum.Or
            ? FractionTypeEnum.NumberIsNull
            : FractionTypeEnum.NumberIsNotNull
      };

      fractions.push(fraction);
    } else if (
      ['=', '!=', '<=', '>=', '<', '>'].indexOf(numberFilter.operator) > -1
    ) {
      // number main
      let fractionOperator =
        (numberFilter as { not: boolean })?.not === true ||
        numberFilter.operator === '!='
          ? FractionOperatorEnum.And
          : FractionOperatorEnum.Or;

      let valuesStr = (numberFilter as NumberCondition).values.join(', '); // multiple values are expected only for '=' and '!=' operators

      let fraction: Fraction = {
        brick:
          numberFilter.operator === '='
            ? fractionOperator === FractionOperatorEnum.Or
              ? `f\`${valuesStr}\``
              : `f\`not ${valuesStr}\`` // becomes !=
            : numberFilter.operator === '!='
              ? fractionOperator === FractionOperatorEnum.Or
                ? `f\`!= ${valuesStr}\`` // not possible
                : `f\`not ${valuesStr}\``
              : numberFilter.operator === '<='
                ? fractionOperator === FractionOperatorEnum.Or
                  ? `f\`<= ${valuesStr}\``
                  : `f\`not <= ${valuesStr}\``
                : numberFilter.operator === '>='
                  ? fractionOperator === FractionOperatorEnum.Or
                    ? `f\`>= ${valuesStr}\``
                    : `f\`not >= ${valuesStr}\``
                  : numberFilter.operator === '<'
                    ? fractionOperator === FractionOperatorEnum.Or
                      ? `f\`< ${valuesStr}\``
                      : `f\`not < ${valuesStr}\``
                    : numberFilter.operator === '>'
                      ? fractionOperator === FractionOperatorEnum.Or
                        ? `f\`> ${valuesStr}\``
                        : `f\`not > ${valuesStr}\``
                      : undefined,
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          numberFilter.operator === '='
            ? fractionOperator === FractionOperatorEnum.Or
              ? FractionTypeEnum.NumberIsEqualTo
              : FractionTypeEnum.NumberIsNotEqualTo // becomes !=
            : numberFilter.operator === '!='
              ? fractionOperator === FractionOperatorEnum.Or
                ? FractionTypeEnum.NumberIsEqualTo // not possible
                : FractionTypeEnum.NumberIsNotEqualTo
              : numberFilter.operator === '<='
                ? fractionOperator === FractionOperatorEnum.Or
                  ? FractionTypeEnum.NumberIsLessThanOrEqualTo
                  : FractionTypeEnum.NumberIsNotLessThanOrEqualTo
                : numberFilter.operator === '>='
                  ? fractionOperator === FractionOperatorEnum.Or
                    ? FractionTypeEnum.NumberIsGreaterThanOrEqualTo
                    : FractionTypeEnum.NumberIsNotGreaterThanOrEqualTo
                  : numberFilter.operator === '<'
                    ? fractionOperator === FractionOperatorEnum.Or
                      ? FractionTypeEnum.NumberIsLessThan
                      : FractionTypeEnum.NumberIsNotLessThan
                    : numberFilter.operator === '>'
                      ? fractionOperator === FractionOperatorEnum.Or
                        ? FractionTypeEnum.NumberIsGreaterThan
                        : FractionTypeEnum.NumberIsNotGreaterThan
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

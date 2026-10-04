import {
  Null,
  NumberCondition,
  NumberFilter,
  NumberRange
} from '@malloydata/malloy-filter';
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';

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
      operator: 'Or',
      type: 'NumberIsAnyValue'
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
      let fractionOperator: FractionOperator =
        (numberFilter as { not: boolean })?.not === true ? 'And' : 'Or';

      let fraction: Fraction = {
        brick:
          range.startOperator === '>=' && range.endOperator === '<='
            ? fractionOperator === 'Or'
              ? `f\`[${range.startValue} to ${range.endValue}]\``
              : `f\`not [${range.startValue} to ${range.endValue}]\``
            : range.startOperator === '>' && range.endOperator === '<'
              ? fractionOperator === 'Or'
                ? `f\`(${range.startValue} to ${range.endValue})\``
                : `f\`not (${range.startValue} to ${range.endValue})\``
              : range.startOperator === '>=' && range.endOperator === '<'
                ? fractionOperator === 'Or'
                  ? `f\`[${range.startValue} to ${range.endValue})\``
                  : `f\`not [${range.startValue} to ${range.endValue})\``
                : range.startOperator === '>' && range.endOperator === '<='
                  ? fractionOperator === 'Or'
                    ? `f\`(${range.startValue} to ${range.endValue}]\``
                    : `f\`not (${range.startValue} to ${range.endValue}]\``
                  : undefined,
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          fractionOperator === 'Or' ? 'NumberIsBetween' : 'NumberIsNotBetween',
        numberValue1: Number(range.startValue),
        numberValue2: Number(range.endValue),
        numberBetweenOption:
          range.startOperator === '>=' && range.endOperator === '<='
            ? 'Inclusive'
            : range.startOperator === '>' && range.endOperator === '<'
              ? 'Exclusive'
              : range.startOperator === '>=' && range.endOperator === '<'
                ? 'LeftInclusive'
                : range.startOperator === '>' && range.endOperator === '<='
                  ? 'RightInclusive'
                  : undefined
      };

      fractions.push(fraction);
    } else if ((numberFilter as Null).operator === 'null') {
      // number null
      let fractionOperator: FractionOperator =
        (numberFilter as { not: boolean })?.not === true ? 'And' : 'Or';

      let fraction: Fraction = {
        brick: fractionOperator === 'Or' ? 'f`null`' : 'f`not null`',
        parentBrick: parentBrick,
        operator: fractionOperator,
        type: fractionOperator === 'Or' ? 'NumberIsNull' : 'NumberIsNotNull'
      };

      fractions.push(fraction);
    } else if (
      ['=', '!=', '<=', '>=', '<', '>'].indexOf(numberFilter.operator) > -1
    ) {
      // number main
      let fractionOperator: FractionOperator =
        (numberFilter as { not: boolean })?.not === true ||
        numberFilter.operator === '!='
          ? 'And'
          : 'Or';

      let valuesStr = (numberFilter as NumberCondition).values.join(', '); // multiple values are expected only for '=' and '!=' operators

      let fraction: Fraction = {
        brick:
          numberFilter.operator === '='
            ? fractionOperator === 'Or'
              ? `f\`${valuesStr}\``
              : `f\`not ${valuesStr}\`` // becomes !=
            : numberFilter.operator === '!='
              ? fractionOperator === 'Or'
                ? `f\`!= ${valuesStr}\`` // not possible
                : `f\`not ${valuesStr}\``
              : numberFilter.operator === '<='
                ? fractionOperator === 'Or'
                  ? `f\`<= ${valuesStr}\``
                  : `f\`not <= ${valuesStr}\``
                : numberFilter.operator === '>='
                  ? fractionOperator === 'Or'
                    ? `f\`>= ${valuesStr}\``
                    : `f\`not >= ${valuesStr}\``
                  : numberFilter.operator === '<'
                    ? fractionOperator === 'Or'
                      ? `f\`< ${valuesStr}\``
                      : `f\`not < ${valuesStr}\``
                    : numberFilter.operator === '>'
                      ? fractionOperator === 'Or'
                        ? `f\`> ${valuesStr}\``
                        : `f\`not > ${valuesStr}\``
                      : undefined,
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          numberFilter.operator === '='
            ? fractionOperator === 'Or'
              ? 'NumberIsEqualTo'
              : 'NumberIsNotEqualTo' // becomes !=
            : numberFilter.operator === '!='
              ? fractionOperator === 'Or'
                ? 'NumberIsEqualTo' // not possible
                : 'NumberIsNotEqualTo'
              : numberFilter.operator === '<='
                ? fractionOperator === 'Or'
                  ? 'NumberIsLessThanOrEqualTo'
                  : 'NumberIsNotLessThanOrEqualTo'
                : numberFilter.operator === '>='
                  ? fractionOperator === 'Or'
                    ? 'NumberIsGreaterThanOrEqualTo'
                    : 'NumberIsNotGreaterThanOrEqualTo'
                  : numberFilter.operator === '<'
                    ? fractionOperator === 'Or'
                      ? 'NumberIsLessThan'
                      : 'NumberIsNotLessThan'
                    : numberFilter.operator === '>'
                      ? fractionOperator === 'Or'
                        ? 'NumberIsGreaterThan'
                        : 'NumberIsNotGreaterThan'
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

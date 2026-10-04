import {
  Null,
  StringCondition,
  StringEmpty,
  StringFilter,
  StringMatch
} from '@malloydata/malloy-filter';
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';
import { malloyEscape } from '#node-common/functions/malloy/get-malloy-filter-string-fractions/malloy-escape/malloy-escape';
import { malloyUnescape } from '#node-common/functions/malloy/get-malloy-filter-string-fractions/malloy-unescape/malloy-unescape';

export function getMalloyFilterStringFractions(item: {
  parsed: StringFilter;
  parentBrick: string;
}) {
  let { parsed, parentBrick } = item;

  let fractions: Fraction[] = [];

  let stringFilters: StringFilter[] = [];

  if (parsed?.operator === ',') {
    // parsed is null for any
    stringFilters = parsed.members;
  } else if (isDefined(parsed)) {
    stringFilters = [parsed];
  } else {
    // string any
    let fraction: Fraction = {
      brick: MALLOY_FILTER_ANY,
      parentBrick: parentBrick,
      operator: 'Or',
      type: 'StringIsAnyValue'
    };

    fractions.push(fraction);
  }

  stringFilters.forEach(stringFilter => {
    if ((stringFilter as Null).operator === 'null') {
      // string null
      let fractionOperator: FractionOperator =
        (stringFilter as { not: boolean })?.not === true ? 'And' : 'Or';

      let fraction: Fraction = {
        brick: fractionOperator === 'Or' ? 'f`null`' : 'f`-null`',
        parentBrick: parentBrick,
        operator: fractionOperator,
        type: fractionOperator === 'Or' ? 'StringIsNull' : 'StringIsNotNull'
      };

      fractions.push(fraction);
    } else if ((stringFilter as StringEmpty).operator === 'empty') {
      // string empty
      let fractionOperator: FractionOperator =
        (stringFilter as { not: boolean })?.not === true ? 'And' : 'Or';

      let fraction: Fraction = {
        brick: fractionOperator === 'Or' ? 'f`empty`' : 'f`-empty`',
        parentBrick: parentBrick,
        operator: fractionOperator,
        type: fractionOperator === 'Or' ? 'StringIsEmpty' : 'StringIsNotEmpty'
      };

      fractions.push(fraction);
    } else if (
      ['~', '=', 'contains', 'starts', 'ends'].indexOf(stringFilter.operator) >
      -1
    ) {
      // string main
      let values = (stringFilter as StringCondition).values ?? [];

      let escapedValues = (stringFilter as StringMatch).escaped_values ?? [];

      let eValues = [
        ...values.map(v => malloyEscape({ str: v })),
        ...escapedValues
      ];

      eValues
        .map(eValue => malloyUnescape({ str: eValue }))
        .forEach(uValue => {
          let fractionOperator: FractionOperator =
            (stringFilter as { not: boolean })?.not === true ? 'And' : 'Or';

          let fraction: Fraction = {
            brick:
              stringFilter.operator === '~'
                ? fractionOperator === 'Or'
                  ? `f\`${uValue}\``
                  : `f\`-${uValue}\``
                : stringFilter.operator === '='
                  ? fractionOperator === 'Or'
                    ? `f\`${uValue}\``
                    : `f\`-${uValue}\``
                  : stringFilter.operator === 'contains'
                    ? fractionOperator === 'Or'
                      ? `f\`%${uValue}%\``
                      : `f\`-%${uValue}%\``
                    : stringFilter.operator === 'starts'
                      ? fractionOperator === 'Or'
                        ? `f\`${uValue}%\``
                        : `f\`-${uValue}%\``
                      : stringFilter.operator === 'ends'
                        ? fractionOperator === 'Or'
                          ? `f\`%${uValue}\``
                          : `f\`-%${uValue}\``
                        : undefined,
            parentBrick: parentBrick,
            operator: fractionOperator,
            type:
              stringFilter.operator === '~'
                ? fractionOperator === 'Or'
                  ? 'StringIsLike'
                  : 'StringIsNotLike'
                : stringFilter.operator === '='
                  ? fractionOperator === 'Or'
                    ? 'StringIsEqualTo'
                    : 'StringIsNotEqualTo'
                  : stringFilter.operator === 'contains'
                    ? fractionOperator === 'Or'
                      ? 'StringContains'
                      : 'StringDoesNotContain'
                    : stringFilter.operator === 'starts'
                      ? fractionOperator === 'Or'
                        ? 'StringStartsWith'
                        : 'StringDoesNotStartWith'
                      : stringFilter.operator === 'ends'
                        ? fractionOperator === 'Or'
                          ? 'StringEndsWith'
                          : 'StringDoesNotEndWith'
                        : undefined,
            stringValue: uValue
          };

          fractions.push(fraction);
        });
    }
  });

  return { fractions: fractions };
}

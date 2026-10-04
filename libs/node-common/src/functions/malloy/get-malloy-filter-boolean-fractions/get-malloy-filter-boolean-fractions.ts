import { BooleanFilter, Null } from '@malloydata/malloy-filter';
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';

export function getMalloyFilterBooleanFractions(item: {
  parsed: BooleanFilter;
  parentBrick: string;
}) {
  let { parsed, parentBrick } = item;

  let fractions: Fraction[] = [];

  let booleanFilters: BooleanFilter[] = [];

  if (isDefined(parsed)) {
    booleanFilters = [parsed];
  } else {
    // boolean any
    let fraction: Fraction = {
      brick: MALLOY_FILTER_ANY,
      parentBrick: parentBrick,
      operator: 'And', // "And" isntead of "Or"
      type: 'BooleanIsAnyValue'
    };

    fractions.push(fraction);
  }

  booleanFilters.forEach(booleanFilter => {
    let fractionOperator: FractionOperator = 'And';

    let isNot = (booleanFilter as { not: boolean })?.not === true;

    if ((booleanFilter as Null).operator === 'null') {
      // boolean null
      let fraction: Fraction = {
        brick: isNot === false ? 'f`null`' : 'f`not null`',
        parentBrick: parentBrick,
        operator: fractionOperator,
        type: isNot === false ? 'BooleanIsNull' : 'BooleanIsNotNull'
      };

      fractions.push(fraction);
    } else if (
      ['true', 'false', '=true', '=false'].indexOf(booleanFilter.operator) > -1
    ) {
      // boolean main
      let fraction: Fraction = {
        brick:
          booleanFilter.operator === 'true'
            ? isNot === false
              ? 'f`true`'
              : 'f`not true`'
            : booleanFilter.operator === '=true'
              ? isNot === false
                ? 'f`=true`'
                : 'f`not =true`'
              : booleanFilter.operator === 'false'
                ? isNot === false
                  ? 'f`false`'
                  : 'f`not false`'
                : booleanFilter.operator === '=false'
                  ? isNot === false
                    ? 'f`=false`'
                    : 'f`not =false`'
                  : undefined,
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          booleanFilter.operator === '=true'
            ? isNot === false
              ? 'BooleanIsTrue'
              : 'BooleanIsNotTrue'
            : booleanFilter.operator === 'true'
              ? isNot === false
                ? 'BooleanIsTruthy'
                : 'BooleanIsNotTruthy'
              : booleanFilter.operator === '=false'
                ? isNot === false
                  ? 'BooleanIsFalse'
                  : 'BooleanIsNotFalse'
                : booleanFilter.operator === 'false'
                  ? isNot === false
                    ? 'BooleanIsFalsy'
                    : 'BooleanIsNotFalsy'
                  : undefined
      };

      fractions.push(fraction);
    }
  });

  return { fractions: fractions };
}

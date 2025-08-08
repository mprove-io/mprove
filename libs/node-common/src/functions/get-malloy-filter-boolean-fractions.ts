import { BooleanFilter, Null } from '@malloydata/malloy-filter';
import { MALLOY_FILTER_ANY } from '~common/_index';
import { common } from '~node-common/barrels/common';

export function getMalloyFilterBooleanFractions(item: {
  parsed: BooleanFilter;
  parentBrick: string;
}) {
  let { parsed, parentBrick } = item;

  let fractions: common.Fraction[] = [];

  let booleanFilters: BooleanFilter[] = [];

  if (common.isDefined(parsed)) {
    booleanFilters = [parsed];
  } else {
    // boolean any
    let fraction: common.Fraction = {
      brick: MALLOY_FILTER_ANY,
      parentBrick: parentBrick,
      operator: common.FractionOperatorEnum.And, // "And" isntead of "Or"
      type: common.FractionTypeEnum.BooleanIsAnyValue
    };

    fractions.push(fraction);
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
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          isNot === false
            ? common.FractionTypeEnum.BooleanIsNull
            : common.FractionTypeEnum.BooleanIsNotNull
      };

      fractions.push(fraction);
    } else if (
      ['true', 'false', 'false_or_null'].indexOf(booleanFilter.operator) > -1
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
        parentBrick: parentBrick,
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

      fractions.push(fraction);
    }
  });

  return fractions;
}

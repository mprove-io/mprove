import { BooleanFilter, Null } from '@malloydata/malloy-filter';
import { MALLOY_FILTER_ANY } from '~common/constants/top';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { Fraction } from '~common/interfaces/blockml/fraction';

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
      operator: FractionOperatorEnum.And, // "And" isntead of "Or"
      type: FractionTypeEnum.BooleanIsAnyValue
    };

    fractions.push(fraction);
  }

  booleanFilters.forEach(booleanFilter => {
    let fractionOperator = FractionOperatorEnum.And;

    let isNot = (booleanFilter as { not: boolean })?.not === true;

    if ((booleanFilter as Null).operator === 'null') {
      // boolean null
      let fraction: Fraction = {
        brick: isNot === false ? 'f`null`' : 'f`not null`',
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          isNot === false
            ? FractionTypeEnum.BooleanIsNull
            : FractionTypeEnum.BooleanIsNotNull
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
              ? FractionTypeEnum.BooleanIsTrue
              : FractionTypeEnum.BooleanIsNotTrue
            : booleanFilter.operator === 'true'
              ? isNot === false
                ? FractionTypeEnum.BooleanIsTruthy
                : FractionTypeEnum.BooleanIsNotTruthy
              : booleanFilter.operator === '=false'
                ? isNot === false
                  ? FractionTypeEnum.BooleanIsFalse
                  : FractionTypeEnum.BooleanIsNotFalse
                : booleanFilter.operator === 'false'
                  ? isNot === false
                    ? FractionTypeEnum.BooleanIsFalsy
                    : FractionTypeEnum.BooleanIsNotFalsy
                  : undefined
      };

      fractions.push(fraction);
    }
  });

  return { fractions: fractions };
}

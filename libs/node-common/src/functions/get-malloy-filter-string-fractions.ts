import {
  Null,
  StringCondition,
  StringEmpty,
  StringFilter,
  StringMatch
} from '@malloydata/malloy-filter';
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { Fraction } from '#common/interfaces/blockml/fraction';

// packages/malloy-filter/src/clause_utils.ts

export function malloyEscape(str: string) {
  const lstr = str.toLowerCase();
  if (lstr === 'null' || lstr === 'empty') {
    return '\\' + str;
  }
  return str.replace(/([,; |()\\%_-])/g, '\\$1');
}

export function malloyUnescape(str: string) {
  return str.replace(/\\(.)/g, '$1');
}

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
      operator: FractionOperatorEnum.Or,
      type: FractionTypeEnum.StringIsAnyValue
    };

    fractions.push(fraction);
  }

  stringFilters.forEach(stringFilter => {
    if ((stringFilter as Null).operator === 'null') {
      // string null
      let fractionOperator =
        (stringFilter as { not: boolean })?.not === true
          ? FractionOperatorEnum.And
          : FractionOperatorEnum.Or;

      let fraction: Fraction = {
        brick:
          fractionOperator === FractionOperatorEnum.Or ? 'f`null`' : 'f`-null`',
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          fractionOperator === FractionOperatorEnum.Or
            ? FractionTypeEnum.StringIsNull
            : FractionTypeEnum.StringIsNotNull
      };

      fractions.push(fraction);
    } else if ((stringFilter as StringEmpty).operator === 'empty') {
      // string empty
      let fractionOperator =
        (stringFilter as { not: boolean })?.not === true
          ? FractionOperatorEnum.And
          : FractionOperatorEnum.Or;

      let fraction: Fraction = {
        brick:
          fractionOperator === FractionOperatorEnum.Or
            ? 'f`empty`'
            : 'f`-empty`',
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          fractionOperator === FractionOperatorEnum.Or
            ? FractionTypeEnum.StringIsEmpty
            : FractionTypeEnum.StringIsNotEmpty
      };

      fractions.push(fraction);
    } else if (
      ['~', '=', 'contains', 'starts', 'ends'].indexOf(stringFilter.operator) >
      -1
    ) {
      // string main
      let values = (stringFilter as StringCondition).values ?? [];

      let escapedValues = (stringFilter as StringMatch).escaped_values ?? [];

      let eValues = [...values.map(v => malloyEscape(v)), ...escapedValues];

      eValues
        .map(eValue => malloyUnescape(eValue))
        .forEach(uValue => {
          let fractionOperator =
            (stringFilter as { not: boolean })?.not === true
              ? FractionOperatorEnum.And
              : FractionOperatorEnum.Or;

          let fraction: Fraction = {
            brick:
              stringFilter.operator === '~'
                ? fractionOperator === FractionOperatorEnum.Or
                  ? `f\`${uValue}\``
                  : `f\`-${uValue}\``
                : stringFilter.operator === '='
                  ? fractionOperator === FractionOperatorEnum.Or
                    ? `f\`${uValue}\``
                    : `f\`-${uValue}\``
                  : stringFilter.operator === 'contains'
                    ? fractionOperator === FractionOperatorEnum.Or
                      ? `f\`%${uValue}%\``
                      : `f\`-%${uValue}%\``
                    : stringFilter.operator === 'starts'
                      ? fractionOperator === FractionOperatorEnum.Or
                        ? `f\`${uValue}%\``
                        : `f\`-${uValue}%\``
                      : stringFilter.operator === 'ends'
                        ? fractionOperator === FractionOperatorEnum.Or
                          ? `f\`%${uValue}\``
                          : `f\`-%${uValue}\``
                        : undefined,
            parentBrick: parentBrick,
            operator: fractionOperator,
            type:
              stringFilter.operator === '~'
                ? fractionOperator === FractionOperatorEnum.Or
                  ? FractionTypeEnum.StringIsLike
                  : FractionTypeEnum.StringIsNotLike
                : stringFilter.operator === '='
                  ? fractionOperator === FractionOperatorEnum.Or
                    ? FractionTypeEnum.StringIsEqualTo
                    : FractionTypeEnum.StringIsNotEqualTo
                  : stringFilter.operator === 'contains'
                    ? fractionOperator === FractionOperatorEnum.Or
                      ? FractionTypeEnum.StringContains
                      : FractionTypeEnum.StringDoesNotContain
                    : stringFilter.operator === 'starts'
                      ? fractionOperator === FractionOperatorEnum.Or
                        ? FractionTypeEnum.StringStartsWith
                        : FractionTypeEnum.StringDoesNotStartWith
                      : stringFilter.operator === 'ends'
                        ? fractionOperator === FractionOperatorEnum.Or
                          ? FractionTypeEnum.StringEndsWith
                          : FractionTypeEnum.StringDoesNotEndWith
                        : undefined,
            stringValue: uValue
          };

          fractions.push(fraction);
        });
    }
  });

  return { fractions: fractions };
}

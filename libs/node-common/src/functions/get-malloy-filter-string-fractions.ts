import {
  Null,
  StringCondition,
  StringEmpty,
  StringFilter,
  StringMatch
} from '@malloydata/malloy-filter';
import { MALLOY_FILTER_ANY } from '~common/_index';
import { common } from '~node-common/barrels/common';

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

export function getMalloyFilterStringFractions(item: {
  parsed: StringFilter;
  parentBrick: string;
}) {
  let { parsed, parentBrick } = item;

  let fractions: common.Fraction[] = [];

  let stringFilters: StringFilter[] = [];

  if (parsed?.operator === ',') {
    // parsed is null for any
    stringFilters = parsed.members;
  } else if (common.isDefined(parsed)) {
    stringFilters = [parsed];
  } else {
    // string any
    let fraction: common.Fraction = {
      brick: MALLOY_FILTER_ANY,
      parentBrick: parentBrick,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.StringIsAnyValue
    };

    fractions.push(fraction);
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
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          fractionOperator === common.FractionOperatorEnum.Or
            ? common.FractionTypeEnum.StringIsNull
            : common.FractionTypeEnum.StringIsNotNull
      };

      fractions.push(fraction);
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
        parentBrick: parentBrick,
        operator: fractionOperator,
        type:
          fractionOperator === common.FractionOperatorEnum.Or
            ? common.FractionTypeEnum.StringIsEmpty
            : common.FractionTypeEnum.StringIsNotEmpty
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
                      ? fractionOperator === common.FractionOperatorEnum.Or
                        ? `f\`%${eValue}\``
                        : `f\`-%${eValue}\``
                      : undefined,
          parentBrick: parentBrick,
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
                      ? fractionOperator === common.FractionOperatorEnum.Or
                        ? common.FractionTypeEnum.StringEndsWith
                        : common.FractionTypeEnum.StringDoesNotEndWith
                      : undefined,
          stringValue: eValue
        };

        fractions.push(fraction);
      });
    }
  });

  return { fractions: fractions };
}

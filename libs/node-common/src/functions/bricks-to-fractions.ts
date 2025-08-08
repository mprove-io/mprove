import { TemporalFilterExpression } from '@malloydata/malloy-filter';
import { common } from '~node-common/barrels/common';
import { getMalloyFilterTsFractions } from './get-malloy-filter-ts-fractions';

export function bricksToFractions(item: {
  filterBricks: string[];
  result: common.FieldResultEnum;
  // parameters below do not affect validation
  weekStart?: common.ProjectWeekStartEnum;
  timezone?: string;
  fractions?: common.Fraction[];
  getTimeRange?: boolean;
  // caseSensitiveStringFilters: boolean;
  // connection?: common.ProjectConnection;
  // proc?: string;
  // sqlTsSelect?: string;
  // ors?: string[];
  // nots?: string[];
  // ins?: string[];
  // notIns?: string[];
}): {
  valid: number;
  brick?: string;
  rangeStart?: number;
  rangeEnd?: number;
} {
  let {
    filterBricks,
    result,
    weekStart,
    timezone,
    fractions,
    getTimeRange
    // caseSensitiveStringFilters,
    // connection,
    // proc,
    // sqlTsSelect,
    // ors,
    // nots,
    // ins,
    // notIns,
  } = item;

  let rangeStart: number;
  let rangeEnd: number;

  // console.log('filterBricks');
  // console.log(filterBricks);

  let answerError: { valid: number; brick?: string };

  let resultFractions: common.Fraction[] = [];

  filterBricks.forEach(brick => {
    // if (brick === 'last 5 days' ) {
    //   console.log('brick match');

    //   let fraction: common.Fraction = {
    //     brick: `last 5 days`,
    //     // parentBrick: 'f`last 5 days`',
    //     operator: common.FractionOperatorEnum.Or,
    //     type: common.FractionTypeEnum.TsIsInLast,
    //     tsLastValue: 5,
    //     tsLastUnit: common.FractionTsUnitEnum.Days,
    //     tsLastCompleteOption:
    //       common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent
    //   };

    let brickPart = brick.slice(2, -1);

    if (
      result === common.FieldResultEnum.Ts ||
      result === common.FieldResultEnum.Date
    ) {
      let parseResult = TemporalFilterExpression.parse(brickPart);

      if (common.isUndefined(parseResult.parsed)) {
        answerError = { valid: 0, brick: brick };
      } else {
        let result = getMalloyFilterTsFractions({
          parentBrick: brick,
          parsed: parseResult.parsed,
          isGetTimeRange: true
        });

        rangeStart = result.rangeStart;
        rangeEnd = result.rangeEnd;

        resultFractions = [...resultFractions, ...result.fractions];
      }
    }
  });

  if (common.isDefined(answerError)) {
    return answerError;
  }

  fractions.push(...resultFractions);

  if (getTimeRange === true) {
    return {
      valid: 1,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd
    };
  }

  return { valid: 1 };
}

import { TemporalFilterExpression } from '@malloydata/malloy-filter';
import { fromUnixTime, getUnixTime, sub } from 'date-fns';
import { common } from '~node-common/barrels/common';
import { getMalloyFilterTsFractions } from './get-malloy-filter-ts-fractions';
import { timeRangeMakeCurrentTimestamps } from './time-range-make-current-timestamps';

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
  rangeOpen?: number;
  rangeClose?: number;
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

  let open;
  let close;

  let rangeOpen: Date;
  let rangeClose: Date;

  let {
    currentTs,
    currentMinuteTs,
    currentHourTs,
    currentDateTs,
    currentWeekStartTs,
    currentMonthTs,
    currentQuarterTs,
    currentYearTs
  } = timeRangeMakeCurrentTimestamps({
    timezone: timezone,
    weekStart: weekStart,
    getTimeRange: getTimeRange
  });

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

    if (brick === 'last 5 days' || brick === 'f`last 5 days`') {
      //   console.log('brick match');

      //   let fraction: common.Fraction = {
      //     brick: 'f`last 5 days`',
      //     parentBrick: 'f`last 5 days`',
      //     operator: common.FractionOperatorEnum.Or,
      //     type: common.FractionTypeEnum.TsIsInLast,
      //     tsLastValue: 5,
      //     tsLastUnit: common.FractionTsUnitEnum.Days,
      //     tsLastCompleteOption:
      //       common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent
      //   };

      //   fractions.push(fraction);

      rangeOpen = sub(fromUnixTime(Number(currentTs)), { days: 5 });

      //   close = currentTs;
      rangeClose = fromUnixTime(Number(currentTs));
    }

    let brickPart = brick.slice(2, -1);

    if (
      result === common.FieldResultEnum.Ts ||
      result === common.FieldResultEnum.Date
    ) {
      let parseResult = TemporalFilterExpression.parse(brickPart);

      if (common.isUndefined(parseResult.parsed)) {
        answerError = { valid: 0, brick: brick };
      } else {
        let bFractions = getMalloyFilterTsFractions({
          parentBrick: brick,
          parsed: parseResult.parsed
        });

        resultFractions = [...resultFractions, ...bFractions];
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
      rangeOpen: common.isDefined(rangeOpen)
        ? getUnixTime(rangeOpen)
        : undefined,
      rangeClose: common.isDefined(rangeClose)
        ? getUnixTime(rangeClose)
        : undefined
    };
  }

  return { valid: 1 };
}

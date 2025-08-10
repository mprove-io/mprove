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
    let brickPart = brick.slice(2, -1);

    // console.log('brickPart');
    // console.log(brickPart);

    if (
      result === common.FieldResultEnum.Ts ||
      result === common.FieldResultEnum.Date
    ) {
      let parseResult = TemporalFilterExpression.parse(brickPart);

      // console.log('parseResult');
      // console.log(parseResult);

      if (common.isUndefined(parseResult.parsed)) {
        answerError = { valid: 0, brick: brick };
      } else {
        let result = getMalloyFilterTsFractions({
          parentBrick: brick,
          parsed: parseResult.parsed,
          isGetTimeRange: true,
          timezone: timezone,
          weekStart: weekStart
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

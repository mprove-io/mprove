import {
  BooleanFilter,
  BooleanFilterExpression,
  NumberFilter,
  NumberFilterExpression,
  StringFilter,
  StringFilterExpression,
  TemporalFilter,
  TemporalFilterExpression
} from '@malloydata/malloy-filter';
import { MALLOY_FILTER_ANY } from '~common/_index';
import { common } from '~node-common/barrels/common';
import { getMalloyFilterBooleanFractions } from './get-malloy-filter-boolean-fractions';
import { getMalloyFilterNumberFractions } from './get-malloy-filter-number-fractions';
import { getMalloyFilterStringFractions } from './get-malloy-filter-string-fractions';
import { getMalloyFilterTsFractions } from './get-malloy-filter-ts-fractions';

export function bricksToFractions(item: {
  filterBricks: string[];
  result: common.FieldResultEnum;
  // parameters below do not affect validation
  getTimeRange?: boolean;
  timeSpec?: common.TimeSpecEnum;
  weekStart?: common.ProjectWeekStartEnum;
  timezone?: string;
  fractions?: common.Fraction[];
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
    timeSpec,
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

  let answerError: { valid: number; brick?: string };

  let resultFractions: common.Fraction[] = [];

  filterBricks.forEach(brick => {
    if (common.isDefined(answerError)) {
      return;
    }

    let parseResult;

    if (
      brick.length < 3 ||
      brick[0] !== 'f' ||
      brick[1] !== '`' ||
      brick[brick.length - 1] !== '`'
    ) {
      answerError = { valid: 0, brick: brick };
      return;
    }

    if (brick !== MALLOY_FILTER_ANY) {
      let brickPart = brick.slice(2, -1);

      parseResult =
        result === common.FieldResultEnum.Ts ||
        result === common.FieldResultEnum.Date
          ? TemporalFilterExpression.parse(brickPart)
          : result === common.FieldResultEnum.String
            ? StringFilterExpression.parse(brickPart)
            : result === common.FieldResultEnum.Number
              ? NumberFilterExpression.parse(brickPart)
              : result === common.FieldResultEnum.Boolean
                ? BooleanFilterExpression.parse(brickPart)
                : undefined;
    }

    if (
      brick !== MALLOY_FILTER_ANY &&
      common.isUndefined(parseResult?.parsed)
    ) {
      answerError = { valid: 0, brick: brick };
      return;
    } else {
      let rs: {
        fractions: common.Fraction[];
        rangeStart?: number;
        rangeEnd?: number;
      } =
        result === common.FieldResultEnum.Ts ||
        result === common.FieldResultEnum.Date
          ? getMalloyFilterTsFractions({
              parentBrick: brick,
              parsed: parseResult?.parsed as TemporalFilter,
              isGetTimeRange: getTimeRange,
              timezone: timezone,
              weekStart: weekStart,
              timeSpec: timeSpec
            })
          : result === common.FieldResultEnum.String
            ? getMalloyFilterStringFractions({
                parentBrick: brick,
                parsed: parseResult?.parsed as StringFilter
              })
            : result === common.FieldResultEnum.Number
              ? getMalloyFilterNumberFractions({
                  parentBrick: brick,
                  parsed: parseResult?.parsed as NumberFilter
                })
              : result === common.FieldResultEnum.Boolean
                ? getMalloyFilterBooleanFractions({
                    parentBrick: brick,
                    parsed: parseResult?.parsed as BooleanFilter
                  })
                : undefined;

      if (getTimeRange === true) {
        rangeStart = rs.rangeStart;
        rangeEnd = rs.rangeEnd;
      }

      resultFractions = [...resultFractions, ...rs.fractions];
    }
  });

  if (common.isDefined(answerError)) {
    return answerError;
  }

  if (common.isDefined(fractions)) {
    fractions.push(...resultFractions);
  }

  if (getTimeRange === true) {
    return {
      valid: 1,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd
    };
  }

  return { valid: 1 };
}

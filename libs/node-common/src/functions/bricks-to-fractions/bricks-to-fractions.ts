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
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { TimeSpec } from '#common/types/shared/time/timespec';
import { getMalloyFilterBooleanFractions } from '#node-common/functions/malloy/get-malloy-filter-boolean-fractions/get-malloy-filter-boolean-fractions';
import { getMalloyFilterNumberFractions } from '#node-common/functions/malloy/get-malloy-filter-number-fractions/get-malloy-filter-number-fractions';
import { getMalloyFilterStringFractions } from '#node-common/functions/malloy/get-malloy-filter-string-fractions/get-malloy-filter-string-fractions';
import { getMalloyFilterTsFractions } from '#node-common/functions/malloy/get-malloy-filter-ts-fractions/get-malloy-filter-ts-fractions';

export function bricksToFractions(item: {
  filterBricks: string[];
  result: FieldResult;
  // parameters below do not affect validation
  isGetTimeRange?: boolean;
  timeSpec?: TimeSpec;
  weekStart?: ProjectWeekStart;
  timezone?: string;
  fractions?: Fraction[];
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
    isGetTimeRange
  } = item;

  let rangeStart: number;
  let rangeEnd: number;

  let answerError: { valid: number; brick?: string };

  let resultFractions: Fraction[] = [];

  filterBricks.forEach(brick => {
    if (isDefined(answerError)) {
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
        result === 'ts' || result === 'date'
          ? TemporalFilterExpression.parse(brickPart)
          : result === 'string'
            ? StringFilterExpression.parse(brickPart)
            : result === 'number'
              ? NumberFilterExpression.parse(brickPart)
              : result === 'boolean'
                ? BooleanFilterExpression.parse(brickPart)
                : undefined;
    }

    if (brick !== MALLOY_FILTER_ANY && isUndefined(parseResult?.parsed)) {
      answerError = { valid: 0, brick: brick };
      return;
    } else {
      let rs: {
        fractions: Fraction[];
        rangeStart?: number;
        rangeEnd?: number;
      } =
        result === 'ts' || result === 'date'
          ? getMalloyFilterTsFractions({
              parentBrick: brick,
              parsed: parseResult?.parsed as TemporalFilter,
              isGetTimeRange: isGetTimeRange,
              timezone: timezone,
              weekStart: weekStart,
              timeSpec: timeSpec
            })
          : result === 'string'
            ? getMalloyFilterStringFractions({
                parentBrick: brick,
                parsed: parseResult?.parsed as StringFilter
              })
            : result === 'number'
              ? getMalloyFilterNumberFractions({
                  parentBrick: brick,
                  parsed: parseResult?.parsed as NumberFilter
                })
              : result === 'boolean'
                ? getMalloyFilterBooleanFractions({
                    parentBrick: brick,
                    parsed: parseResult?.parsed as BooleanFilter
                  })
                : undefined;

      if (isGetTimeRange === true) {
        rangeStart = rs.rangeStart;
        rangeEnd = rs.rangeEnd;
      }

      resultFractions = [...resultFractions, ...rs.fractions];
    }
  });

  if (isDefined(answerError)) {
    return answerError;
  }

  if (isDefined(fractions)) {
    fractions.push(...resultFractions);
  }

  if (isGetTimeRange === true) {
    return {
      valid: 1,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd
    };
  }

  return { valid: 1 };
}

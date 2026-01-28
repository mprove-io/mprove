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
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { Fraction } from '#common/interfaces/blockml/fraction';
import { getMalloyFilterBooleanFractions } from './get-malloy-filter-boolean-fractions';
import { getMalloyFilterNumberFractions } from './get-malloy-filter-number-fractions';
import { getMalloyFilterStringFractions } from './get-malloy-filter-string-fractions';
import { getMalloyFilterTsFractions } from './get-malloy-filter-ts-fractions';

export function bricksToFractions(item: {
  filterBricks: string[];
  result: FieldResultEnum;
  // parameters below do not affect validation
  isGetTimeRange?: boolean;
  timeSpec?: TimeSpecEnum;
  weekStart?: ProjectWeekStartEnum;
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
        result === FieldResultEnum.Ts || result === FieldResultEnum.Date
          ? TemporalFilterExpression.parse(brickPart)
          : result === FieldResultEnum.String
            ? StringFilterExpression.parse(brickPart)
            : result === FieldResultEnum.Number
              ? NumberFilterExpression.parse(brickPart)
              : result === FieldResultEnum.Boolean
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
        result === FieldResultEnum.Ts || result === FieldResultEnum.Date
          ? getMalloyFilterTsFractions({
              parentBrick: brick,
              parsed: parseResult?.parsed as TemporalFilter,
              isGetTimeRange: isGetTimeRange,
              timezone: timezone,
              weekStart: weekStart,
              timeSpec: timeSpec
            })
          : result === FieldResultEnum.String
            ? getMalloyFilterStringFractions({
                parentBrick: brick,
                parsed: parseResult?.parsed as StringFilter
              })
            : result === FieldResultEnum.Number
              ? getMalloyFilterNumberFractions({
                  parentBrick: brick,
                  parsed: parseResult?.parsed as NumberFilter
                })
              : result === FieldResultEnum.Boolean
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

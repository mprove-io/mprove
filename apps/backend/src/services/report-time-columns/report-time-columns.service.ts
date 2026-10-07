import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInQuarters,
  differenceInWeeks,
  differenceInYears,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMinuteOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  fromUnixTime,
  getUnixTime,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  sub
} from 'date-fns';
import { BackendConfig } from '#backend/config/backend-config';
import { nodeFormatTsUnix } from '#backend/functions/node-format-ts-unix/node-format-ts-unix';
import { ServerError } from '#common/classes/server-error/server-error';
import { TIME_COLUMNS_LIMIT } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionType } from '#common/types/blockml/parts/fraction/fraction-type';
import type { Column } from '#common/types/blockml/parts/report/column';
import type { TimeSpec } from '#common/types/shared/time/timespec';
import { bricksToFractions } from '#node-common/functions/bricks-to-fractions/bricks-to-fractions';

const upperBoundTimeFractionTypes = [
  'TsIsBefore',
  'TsIsThrough'
] satisfies FractionType[];

@Injectable()
export class ReportTimeColumnsService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  async getTimeColumns(item: {
    traceId: string;
    timezone: string;
    timeSpec: TimeSpec;
    timeRangeFractionBrick: string;
    projectWeekStart: ProjectWeekStart;
    caseSensitiveStringFilters: boolean;
  }) {
    let {
      traceId,
      timezone,
      timeSpec,
      timeRangeFractionBrick,
      projectWeekStart,
      caseSensitiveStringFilters
    } = item;

    let timeColumnsLimit = TIME_COLUMNS_LIMIT;

    let fractions: Fraction[] = [];

    let p = bricksToFractions({
      filterBricks: [timeRangeFractionBrick],
      result: 'ts',
      fractions: fractions,
      isGetTimeRange: true,
      timezone: timezone,
      weekStart: projectWeekStart,
      timeSpec: timeSpec
    });

    if (p.valid !== 1) {
      throw new ServerError({
        message: 'BACKEND_WRONG_TIME_RANGE'
      });
    }

    let timeRangeFraction = fractions[0];

    let respRangeStart = p.rangeStart;
    let respRangeEnd = p.rangeEnd;

    let rangeStart =
      isUndefined(respRangeStart) && isUndefined(respRangeEnd)
        ? undefined
        : isDefined(respRangeStart)
          ? respRangeStart
          : timeSpec === 'timestamps'
            ? undefined
            : getUnixTime(
                sub(
                  fromUnixTime(respRangeEnd),
                  timeSpec === 'years'
                    ? { years: timeColumnsLimit }
                    : timeSpec === 'quarters'
                      ? { months: timeColumnsLimit * 3 }
                      : timeSpec === 'months'
                        ? { months: timeColumnsLimit }
                        : timeSpec === 'weeks'
                          ? { days: timeColumnsLimit * 7 }
                          : timeSpec === 'days'
                            ? { days: timeColumnsLimit }
                            : timeSpec === 'hours'
                              ? { hours: timeColumnsLimit }
                              : timeSpec === 'minutes'
                                ? { minutes: timeColumnsLimit }
                                : {}
                )
              );

    let rangeEnd =
      isUndefined(respRangeStart) && isUndefined(respRangeEnd)
        ? undefined
        : isDefined(respRangeEnd)
          ? respRangeEnd
          : timeSpec === 'timestamps'
            ? undefined
            : getUnixTime(
                add(
                  fromUnixTime(respRangeStart),
                  timeSpec === 'years'
                    ? { years: timeColumnsLimit }
                    : timeSpec === 'quarters'
                      ? { months: timeColumnsLimit * 3 }
                      : timeSpec === 'months'
                        ? { months: timeColumnsLimit }
                        : timeSpec === 'weeks'
                          ? { days: timeColumnsLimit * 7 }
                          : timeSpec === 'days'
                            ? { days: timeColumnsLimit }
                            : timeSpec === 'hours'
                              ? { hours: timeColumnsLimit }
                              : timeSpec === 'minutes'
                                ? { minutes: timeColumnsLimit }
                                : {}
                )
              );

    let startDate = isDefined(rangeStart)
      ? new Date(rangeStart * 1000)
      : undefined;

    let endDate = isDefined(rangeEnd) ? new Date(rangeEnd * 1000) : undefined;

    let diffColumnsLength =
      timeSpec === 'timestamps'
        ? 0
        : timeSpec === 'years'
          ? differenceInYears(endDate, startDate)
          : timeSpec === 'quarters'
            ? differenceInQuarters(endDate, startDate)
            : timeSpec === 'months'
              ? differenceInMonths(endDate, startDate)
              : timeSpec === 'weeks'
                ? differenceInWeeks(endDate, startDate)
                : timeSpec === 'days'
                  ? differenceInDays(endDate, startDate)
                  : timeSpec === 'hours'
                    ? differenceInHours(endDate, startDate)
                    : timeSpec === 'minutes'
                      ? differenceInMinutes(endDate, startDate)
                      : undefined;

    let isTimeColumnsLimitExceeded = false;

    if (diffColumnsLength > timeColumnsLimit) {
      isTimeColumnsLimitExceeded = true;

      if (
        // maybe no such case
        upperBoundTimeFractionTypes.findIndex(
          candidate => candidate === timeRangeFraction.type
        ) > -1
      ) {
        startDate = sub(
          endDate,
          timeSpec === 'years'
            ? { years: timeColumnsLimit }
            : timeSpec === 'quarters'
              ? { months: timeColumnsLimit * 3 }
              : timeSpec === 'months'
                ? { months: timeColumnsLimit }
                : timeSpec === 'weeks'
                  ? { days: timeColumnsLimit * 7 }
                  : timeSpec === 'days'
                    ? { days: timeColumnsLimit }
                    : timeSpec === 'hours'
                      ? { hours: timeColumnsLimit }
                      : timeSpec === 'minutes'
                        ? { minutes: timeColumnsLimit }
                        : {}
        );
      } else {
        endDate = add(
          startDate,
          timeSpec === 'years'
            ? { years: timeColumnsLimit }
            : timeSpec === 'quarters'
              ? { months: timeColumnsLimit * 3 }
              : timeSpec === 'months'
                ? { months: timeColumnsLimit }
                : timeSpec === 'weeks'
                  ? { days: timeColumnsLimit * 7 }
                  : timeSpec === 'days'
                    ? { days: timeColumnsLimit }
                    : timeSpec === 'hours'
                      ? { hours: timeColumnsLimit }
                      : timeSpec === 'minutes'
                        ? { minutes: timeColumnsLimit }
                        : {}
        );
      }
    }

    let timeColumns =
      isDefined(startDate) &&
      isDefined(endDate) &&
      getUnixTime(startDate) === getUnixTime(endDate)
        ? timeSpec === 'timestamps'
          ? [startDate]
          : timeSpec === 'years'
            ? [startOfYear(startDate)]
            : timeSpec === 'quarters'
              ? [startOfQuarter(startDate)]
              : timeSpec === 'months'
                ? [startOfMonth(startDate)]
                : timeSpec === 'weeks'
                  ? [
                      startOfWeek(startDate, {
                        weekStartsOn: projectWeekStart === 'Sunday' ? 0 : 1
                      })
                    ]
                  : timeSpec === 'days'
                    ? [startOfDay(startDate)]
                    : timeSpec === 'hours'
                      ? [startOfHour(startDate)]
                      : timeSpec === 'minutes'
                        ? [startOfMinute(startDate)]
                        : undefined
        : timeSpec === 'years'
          ? eachYearOfInterval({
              start: startDate,
              end: endDate
            })
          : timeSpec === 'quarters'
            ? eachQuarterOfInterval({
                start: startDate,
                end: endDate
              })
            : timeSpec === 'months'
              ? eachMonthOfInterval({
                  start: startDate,
                  end: endDate
                })
              : timeSpec === 'weeks'
                ? eachWeekOfInterval(
                    {
                      start: startDate,
                      end: endDate
                    },
                    {
                      weekStartsOn: projectWeekStart === 'Sunday' ? 0 : 1
                    }
                  )
                : timeSpec === 'days'
                  ? eachDayOfInterval({
                      start: startDate,
                      end: endDate
                    })
                  : timeSpec === 'hours'
                    ? eachHourOfInterval({
                        start: startDate,
                        end: endDate
                      })
                    : timeSpec === 'minutes'
                      ? eachMinuteOfInterval({
                          start: startDate,
                          end: endDate
                        })
                      : timeSpec === 'timestamps' &&
                          isDefined(startDate) &&
                          isDefined(endDate)
                        ? [startDate, endDate]
                        : timeSpec === 'timestamps' && isDefined(startDate)
                          ? [startDate]
                          : timeSpec === 'timestamps' && isDefined(endDate)
                            ? [endDate]
                            : undefined;

    if (
      timeSpec !== 'timestamps' &&
      timeColumns.length > 1 &&
      getUnixTime(timeColumns[timeColumns.length - 1]) === getUnixTime(endDate)
    ) {
      timeColumns.pop();
    }

    if (timeSpec !== 'timestamps' && timeColumns.length > timeColumnsLimit) {
      if (
        upperBoundTimeFractionTypes.findIndex(
          candidate => candidate === timeRangeFraction.type
        ) > -1
      ) {
        timeColumns.shift(); // detail "years" is before calendar day "2025-01-02"
      } else {
        timeColumns.pop(); // detail "years" is after calendar day "2025-01-02"
      }
    }

    let columns = timeColumns.map(x => {
      let unixTimeZoned = getUnixTime(x);

      let column: Column = {
        columnId: unixTimeZoned,
        label: nodeFormatTsUnix({
          timeSpec: timeSpec,
          unixTimeZoned: unixTimeZoned
        })
      };

      return column;
    });

    return {
      columns: columns,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded,
      timeColumnsLimit: timeColumnsLimit,
      timeRangeFraction: timeRangeFraction,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd
    };
  }
}

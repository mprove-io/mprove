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
import { BackendConfig } from '~backend/config/backend-config';
import { TIME_COLUMNS_LIMIT } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { Column } from '~common/interfaces/blockml/column';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { ServerError } from '~common/models/server-error';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';
import { nodeFormatTsUnix } from '~node-common/functions/node-format-ts-unix';

@Injectable()
export class ReportTimeColumnsService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  async getTimeColumns(item: {
    traceId: string;
    timezone: string;
    timeSpec: TimeSpecEnum;
    timeRangeFractionBrick: string;
    projectWeekStart: ProjectWeekStartEnum;
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
      // caseSensitiveStringFilters: caseSensitiveStringFilters,
      filterBricks: [timeRangeFractionBrick],
      result: FieldResultEnum.Ts,
      fractions: fractions,
      isGetTimeRange: true,
      timezone: timezone,
      weekStart: projectWeekStart,
      timeSpec: timeSpec
    });

    if (p.valid !== 1) {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_TIME_RANGE
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
          : timeSpec === TimeSpecEnum.Timestamps
            ? undefined
            : getUnixTime(
                sub(
                  fromUnixTime(respRangeEnd),
                  timeSpec === TimeSpecEnum.Years
                    ? { years: timeColumnsLimit }
                    : timeSpec === TimeSpecEnum.Quarters
                      ? { months: timeColumnsLimit * 3 }
                      : timeSpec === TimeSpecEnum.Months
                        ? { months: timeColumnsLimit }
                        : timeSpec === TimeSpecEnum.Weeks
                          ? { days: timeColumnsLimit * 7 }
                          : timeSpec === TimeSpecEnum.Days
                            ? { days: timeColumnsLimit }
                            : timeSpec === TimeSpecEnum.Hours
                              ? { hours: timeColumnsLimit }
                              : timeSpec === TimeSpecEnum.Minutes
                                ? { minutes: timeColumnsLimit }
                                : {}
                )
              );

    let rangeEnd =
      isUndefined(respRangeStart) && isUndefined(respRangeEnd)
        ? undefined
        : isDefined(respRangeEnd)
          ? respRangeEnd
          : timeSpec === TimeSpecEnum.Timestamps
            ? undefined
            : getUnixTime(
                add(
                  fromUnixTime(respRangeStart),
                  timeSpec === TimeSpecEnum.Years
                    ? { years: timeColumnsLimit }
                    : timeSpec === TimeSpecEnum.Quarters
                      ? { months: timeColumnsLimit * 3 }
                      : timeSpec === TimeSpecEnum.Months
                        ? { months: timeColumnsLimit }
                        : timeSpec === TimeSpecEnum.Weeks
                          ? { days: timeColumnsLimit * 7 }
                          : timeSpec === TimeSpecEnum.Days
                            ? { days: timeColumnsLimit }
                            : timeSpec === TimeSpecEnum.Hours
                              ? { hours: timeColumnsLimit }
                              : timeSpec === TimeSpecEnum.Minutes
                                ? { minutes: timeColumnsLimit }
                                : {}
                )
              );

    let startDate = isDefined(rangeStart)
      ? new Date(rangeStart * 1000)
      : undefined;

    let endDate = isDefined(rangeEnd) ? new Date(rangeEnd * 1000) : undefined;

    let diffColumnsLength =
      timeSpec === TimeSpecEnum.Timestamps
        ? 0
        : timeSpec === TimeSpecEnum.Years
          ? differenceInYears(endDate, startDate)
          : timeSpec === TimeSpecEnum.Quarters
            ? differenceInQuarters(endDate, startDate)
            : timeSpec === TimeSpecEnum.Months
              ? differenceInMonths(endDate, startDate)
              : timeSpec === TimeSpecEnum.Weeks
                ? differenceInWeeks(endDate, startDate)
                : timeSpec === TimeSpecEnum.Days
                  ? differenceInDays(endDate, startDate)
                  : timeSpec === TimeSpecEnum.Hours
                    ? differenceInHours(endDate, startDate)
                    : timeSpec === TimeSpecEnum.Minutes
                      ? differenceInMinutes(endDate, startDate)
                      : undefined;

    let isTimeColumnsLimitExceeded = false;

    if (diffColumnsLength > timeColumnsLimit) {
      isTimeColumnsLimitExceeded = true;

      if (
        [
          FractionTypeEnum.TsIsBefore, // maybe no such case
          FractionTypeEnum.TsIsThrough // maybe no such case
        ].indexOf(timeRangeFraction.type) > -1
      ) {
        startDate = sub(
          endDate,
          timeSpec === TimeSpecEnum.Years
            ? { years: timeColumnsLimit }
            : timeSpec === TimeSpecEnum.Quarters
              ? { months: timeColumnsLimit * 3 }
              : timeSpec === TimeSpecEnum.Months
                ? { months: timeColumnsLimit }
                : timeSpec === TimeSpecEnum.Weeks
                  ? { days: timeColumnsLimit * 7 }
                  : timeSpec === TimeSpecEnum.Days
                    ? { days: timeColumnsLimit }
                    : timeSpec === TimeSpecEnum.Hours
                      ? { hours: timeColumnsLimit }
                      : timeSpec === TimeSpecEnum.Minutes
                        ? { minutes: timeColumnsLimit }
                        : {}
        );
      } else {
        endDate = add(
          startDate,
          timeSpec === TimeSpecEnum.Years
            ? { years: timeColumnsLimit }
            : timeSpec === TimeSpecEnum.Quarters
              ? { months: timeColumnsLimit * 3 }
              : timeSpec === TimeSpecEnum.Months
                ? { months: timeColumnsLimit }
                : timeSpec === TimeSpecEnum.Weeks
                  ? { days: timeColumnsLimit * 7 }
                  : timeSpec === TimeSpecEnum.Days
                    ? { days: timeColumnsLimit }
                    : timeSpec === TimeSpecEnum.Hours
                      ? { hours: timeColumnsLimit }
                      : timeSpec === TimeSpecEnum.Minutes
                        ? { minutes: timeColumnsLimit }
                        : {}
        );
      }
    }

    let timeColumns =
      isDefined(startDate) &&
      isDefined(endDate) &&
      getUnixTime(startDate) === getUnixTime(endDate)
        ? timeSpec === TimeSpecEnum.Timestamps
          ? [startDate]
          : timeSpec === TimeSpecEnum.Years
            ? [startOfYear(startDate)]
            : timeSpec === TimeSpecEnum.Quarters
              ? [startOfQuarter(startDate)]
              : timeSpec === TimeSpecEnum.Months
                ? [startOfMonth(startDate)]
                : timeSpec === TimeSpecEnum.Weeks
                  ? [
                      startOfWeek(startDate, {
                        weekStartsOn:
                          projectWeekStart === ProjectWeekStartEnum.Sunday
                            ? 0
                            : 1
                      })
                    ]
                  : timeSpec === TimeSpecEnum.Days
                    ? [startOfDay(startDate)]
                    : timeSpec === TimeSpecEnum.Hours
                      ? [startOfHour(startDate)]
                      : timeSpec === TimeSpecEnum.Minutes
                        ? [startOfMinute(startDate)]
                        : undefined
        : timeSpec === TimeSpecEnum.Years
          ? eachYearOfInterval({
              start: startDate,
              end: endDate
            })
          : timeSpec === TimeSpecEnum.Quarters
            ? eachQuarterOfInterval({
                start: startDate,
                end: endDate
              })
            : timeSpec === TimeSpecEnum.Months
              ? eachMonthOfInterval({
                  start: startDate,
                  end: endDate
                })
              : timeSpec === TimeSpecEnum.Weeks
                ? eachWeekOfInterval(
                    {
                      start: startDate,
                      end: endDate
                    },
                    {
                      weekStartsOn:
                        projectWeekStart === ProjectWeekStartEnum.Sunday ? 0 : 1
                    }
                  )
                : timeSpec === TimeSpecEnum.Days
                  ? eachDayOfInterval({
                      start: startDate,
                      end: endDate
                    })
                  : timeSpec === TimeSpecEnum.Hours
                    ? eachHourOfInterval({
                        start: startDate,
                        end: endDate
                      })
                    : timeSpec === TimeSpecEnum.Minutes
                      ? eachMinuteOfInterval({
                          start: startDate,
                          end: endDate
                        })
                      : timeSpec === TimeSpecEnum.Timestamps &&
                          isDefined(startDate) &&
                          isDefined(endDate)
                        ? [startDate, endDate]
                        : timeSpec === TimeSpecEnum.Timestamps &&
                            isDefined(startDate)
                          ? [startDate]
                          : timeSpec === TimeSpecEnum.Timestamps &&
                              isDefined(endDate)
                            ? [endDate]
                            : undefined;

    if (
      timeSpec !== TimeSpecEnum.Timestamps &&
      timeColumns.length > 1 &&
      getUnixTime(timeColumns[timeColumns.length - 1]) === getUnixTime(endDate)
    ) {
      timeColumns.pop();
    }

    if (
      timeSpec !== TimeSpecEnum.Timestamps &&
      timeColumns.length > timeColumnsLimit
    ) {
      if (
        [FractionTypeEnum.TsIsBefore, FractionTypeEnum.TsIsThrough].indexOf(
          timeRangeFraction.type
        ) > -1
      ) {
        console.log('timeColumns.shift()');
        timeColumns.shift(); // detail "years" is before calendar day "2025-01-02"
      } else {
        console.log('timeColumns.pop()');
        timeColumns.pop(); // detail "years" is after calendar day "2025-01-02"
      }
    }

    let columns = timeColumns.map(x => {
      let unixTimeZoned = getUnixTime(x);
      // let unixDateZoned = new Date(unixTimeZoned * 1000);
      // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

      let column: Column = {
        columnId: unixTimeZoned,
        // tsUTC: tsUTC,
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

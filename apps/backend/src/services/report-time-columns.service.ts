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
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { nodeCommon } from '~backend/barrels/node-common';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';

@Injectable()
export class ReportTimeColumnsService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async getTimeColumns(item: {
    traceId: string;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFractionBrick: string;
    projectWeekStart: common.ProjectWeekStartEnum;
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

    let timeColumnsLimit = common.TIME_COLUMNS_LIMIT;

    let fractions: common.Fraction[] = [];

    let p = bricksToFractions({
      // caseSensitiveStringFilters: caseSensitiveStringFilters,
      filterBricks: [timeRangeFractionBrick],
      result: common.FieldResultEnum.Ts,
      fractions: fractions,
      isGetTimeRange: true,
      timezone: timezone,
      weekStart: projectWeekStart,
      timeSpec: timeSpec
    });

    if (p.valid !== 1) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_WRONG_TIME_RANGE
      });
    }

    let timeRangeFraction = fractions[0];

    let respRangeStart = p.rangeStart;
    let respRangeEnd = p.rangeEnd;

    let rangeStart =
      common.isUndefined(respRangeStart) && common.isUndefined(respRangeEnd)
        ? undefined
        : common.isDefined(respRangeStart)
          ? respRangeStart
          : timeSpec === common.TimeSpecEnum.Timestamps
            ? undefined
            : getUnixTime(
                sub(
                  fromUnixTime(respRangeEnd),
                  timeSpec === common.TimeSpecEnum.Years
                    ? { years: timeColumnsLimit }
                    : timeSpec === common.TimeSpecEnum.Quarters
                      ? { months: timeColumnsLimit * 3 }
                      : timeSpec === common.TimeSpecEnum.Months
                        ? { months: timeColumnsLimit }
                        : timeSpec === common.TimeSpecEnum.Weeks
                          ? { days: timeColumnsLimit * 7 }
                          : timeSpec === common.TimeSpecEnum.Days
                            ? { days: timeColumnsLimit }
                            : timeSpec === common.TimeSpecEnum.Hours
                              ? { hours: timeColumnsLimit }
                              : timeSpec === common.TimeSpecEnum.Minutes
                                ? { minutes: timeColumnsLimit }
                                : {}
                )
              );

    let rangeEnd =
      common.isUndefined(respRangeStart) && common.isUndefined(respRangeEnd)
        ? undefined
        : common.isDefined(respRangeEnd)
          ? respRangeEnd
          : timeSpec === common.TimeSpecEnum.Timestamps
            ? undefined
            : getUnixTime(
                add(
                  fromUnixTime(respRangeStart),
                  timeSpec === common.TimeSpecEnum.Years
                    ? { years: timeColumnsLimit }
                    : timeSpec === common.TimeSpecEnum.Quarters
                      ? { months: timeColumnsLimit * 3 }
                      : timeSpec === common.TimeSpecEnum.Months
                        ? { months: timeColumnsLimit }
                        : timeSpec === common.TimeSpecEnum.Weeks
                          ? { days: timeColumnsLimit * 7 }
                          : timeSpec === common.TimeSpecEnum.Days
                            ? { days: timeColumnsLimit }
                            : timeSpec === common.TimeSpecEnum.Hours
                              ? { hours: timeColumnsLimit }
                              : timeSpec === common.TimeSpecEnum.Minutes
                                ? { minutes: timeColumnsLimit }
                                : {}
                )
              );

    let startDate = common.isDefined(rangeStart)
      ? new Date(rangeStart * 1000)
      : undefined;

    let endDate = common.isDefined(rangeEnd)
      ? new Date(rangeEnd * 1000)
      : undefined;

    let diffColumnsLength =
      timeSpec === common.TimeSpecEnum.Timestamps
        ? 0
        : timeSpec === common.TimeSpecEnum.Years
          ? differenceInYears(endDate, startDate)
          : timeSpec === common.TimeSpecEnum.Quarters
            ? differenceInQuarters(endDate, startDate)
            : timeSpec === common.TimeSpecEnum.Months
              ? differenceInMonths(endDate, startDate)
              : timeSpec === common.TimeSpecEnum.Weeks
                ? differenceInWeeks(endDate, startDate)
                : timeSpec === common.TimeSpecEnum.Days
                  ? differenceInDays(endDate, startDate)
                  : timeSpec === common.TimeSpecEnum.Hours
                    ? differenceInHours(endDate, startDate)
                    : timeSpec === common.TimeSpecEnum.Minutes
                      ? differenceInMinutes(endDate, startDate)
                      : undefined;

    let isTimeColumnsLimitExceeded = false;

    if (diffColumnsLength > timeColumnsLimit) {
      isTimeColumnsLimitExceeded = true;

      if (
        [
          common.FractionTypeEnum.TsIsBefore, // maybe no such case
          common.FractionTypeEnum.TsIsThrough // maybe no such case
        ].indexOf(timeRangeFraction.type) > -1
      ) {
        startDate = sub(
          endDate,
          timeSpec === common.TimeSpecEnum.Years
            ? { years: timeColumnsLimit }
            : timeSpec === common.TimeSpecEnum.Quarters
              ? { months: timeColumnsLimit * 3 }
              : timeSpec === common.TimeSpecEnum.Months
                ? { months: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Weeks
                  ? { days: timeColumnsLimit * 7 }
                  : timeSpec === common.TimeSpecEnum.Days
                    ? { days: timeColumnsLimit }
                    : timeSpec === common.TimeSpecEnum.Hours
                      ? { hours: timeColumnsLimit }
                      : timeSpec === common.TimeSpecEnum.Minutes
                        ? { minutes: timeColumnsLimit }
                        : {}
        );
      } else {
        endDate = add(
          startDate,
          timeSpec === common.TimeSpecEnum.Years
            ? { years: timeColumnsLimit }
            : timeSpec === common.TimeSpecEnum.Quarters
              ? { months: timeColumnsLimit * 3 }
              : timeSpec === common.TimeSpecEnum.Months
                ? { months: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Weeks
                  ? { days: timeColumnsLimit * 7 }
                  : timeSpec === common.TimeSpecEnum.Days
                    ? { days: timeColumnsLimit }
                    : timeSpec === common.TimeSpecEnum.Hours
                      ? { hours: timeColumnsLimit }
                      : timeSpec === common.TimeSpecEnum.Minutes
                        ? { minutes: timeColumnsLimit }
                        : {}
        );
      }
    }

    let timeColumns =
      common.isDefined(startDate) &&
      common.isDefined(endDate) &&
      getUnixTime(startDate) === getUnixTime(endDate)
        ? timeSpec === common.TimeSpecEnum.Timestamps
          ? [startDate]
          : timeSpec === common.TimeSpecEnum.Years
            ? [startOfYear(startDate)]
            : timeSpec === common.TimeSpecEnum.Quarters
              ? [startOfQuarter(startDate)]
              : timeSpec === common.TimeSpecEnum.Months
                ? [startOfMonth(startDate)]
                : timeSpec === common.TimeSpecEnum.Weeks
                  ? [
                      startOfWeek(startDate, {
                        weekStartsOn:
                          projectWeekStart ===
                          common.ProjectWeekStartEnum.Sunday
                            ? 0
                            : 1
                      })
                    ]
                  : timeSpec === common.TimeSpecEnum.Days
                    ? [startOfDay(startDate)]
                    : timeSpec === common.TimeSpecEnum.Hours
                      ? [startOfHour(startDate)]
                      : timeSpec === common.TimeSpecEnum.Minutes
                        ? [startOfMinute(startDate)]
                        : undefined
        : timeSpec === common.TimeSpecEnum.Years
          ? eachYearOfInterval({
              start: startDate,
              end: endDate
            })
          : timeSpec === common.TimeSpecEnum.Quarters
            ? eachQuarterOfInterval({
                start: startDate,
                end: endDate
              })
            : timeSpec === common.TimeSpecEnum.Months
              ? eachMonthOfInterval({
                  start: startDate,
                  end: endDate
                })
              : timeSpec === common.TimeSpecEnum.Weeks
                ? eachWeekOfInterval(
                    {
                      start: startDate,
                      end: endDate
                    },
                    {
                      weekStartsOn:
                        projectWeekStart === common.ProjectWeekStartEnum.Sunday
                          ? 0
                          : 1
                    }
                  )
                : timeSpec === common.TimeSpecEnum.Days
                  ? eachDayOfInterval({
                      start: startDate,
                      end: endDate
                    })
                  : timeSpec === common.TimeSpecEnum.Hours
                    ? eachHourOfInterval({
                        start: startDate,
                        end: endDate
                      })
                    : timeSpec === common.TimeSpecEnum.Minutes
                      ? eachMinuteOfInterval({
                          start: startDate,
                          end: endDate
                        })
                      : timeSpec === common.TimeSpecEnum.Timestamps &&
                          common.isDefined(startDate) &&
                          common.isDefined(endDate)
                        ? [startDate, endDate]
                        : timeSpec === common.TimeSpecEnum.Timestamps &&
                            common.isDefined(startDate)
                          ? [startDate]
                          : timeSpec === common.TimeSpecEnum.Timestamps &&
                              common.isDefined(endDate)
                            ? [endDate]
                            : undefined;

    if (
      timeSpec !== common.TimeSpecEnum.Timestamps &&
      timeColumns.length > 1 &&
      getUnixTime(timeColumns[timeColumns.length - 1]) === getUnixTime(endDate)
    ) {
      timeColumns.pop();
    }

    if (
      timeSpec !== common.TimeSpecEnum.Timestamps &&
      timeColumns.length > timeColumnsLimit
    ) {
      if (
        [
          common.FractionTypeEnum.TsIsBefore,
          common.FractionTypeEnum.TsIsThrough
        ].indexOf(timeRangeFraction.type) > -1
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

      let column: common.Column = {
        columnId: unixTimeZoned,
        // tsUTC: tsUTC,
        label: nodeCommon.nodeFormatTsUnix({
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

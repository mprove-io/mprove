import type {
  Moment,
  TemporalLiteral,
  WeekdayMoment,
  WhichdayMoment
} from '@malloydata/malloy-filter';
import { add, type Duration, fromUnixTime, getUnixTime, sub } from 'date-fns';
import { FractionTsUnitEnum } from '#common/enums/fraction/fraction-ts-unit.enum';
import type { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { getCurrentUnitStartTs } from '#node-common/functions/get-current-unit-start-ts/get-current-unit-start-ts';
import { getUnitDuration } from '#node-common/functions/get-unit-duration/get-unit-duration';
import { getTimeSpecUnitStartTs as getTimeSpecUnitMomentStartTs } from '#node-common/functions/malloy/get-malloy-filter-ts-fractions/get-start/get-timespec-unit-start-ts/get-timespec-unit-start-ts';
import { getUnixTimeFromDateParts } from '#node-common/functions/malloy/get-malloy-filter-ts-fractions/get-start/get-unix-time-from-date-parts/get-unix-time-from-date-parts';
import { getUnixTimeFromDayOfWeek } from '#node-common/functions/malloy/get-malloy-filter-ts-fractions/get-start/get-unix-time-from-day-of-week/get-unix-time-from-day-of-week';

export type GetStartOutput = {
  timeSpecOneUnitDuration: Duration;
  timeSpecMomentRangeStart: number;
  momentRangeStart: number;
  momentUnit: FractionTsUnitEnum;
  momentOneUnitDuration: Duration;
};

export function getStart(item: {
  currentTs: number;
  timeSpec: TimeSpecEnum;
  moment: Moment;
  weekStart: ProjectWeekStartEnum;
  timezone: string;
  agoFromNowQuantity: number;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}) {
  let {
    currentTs,
    timeSpec,
    moment,
    timezone,
    weekStart,
    agoFromNowQuantity,
    year,
    month,
    day,
    hour,
    minute
  } = item;

  let momentUnit =
    (moment as TemporalLiteral).units === 'year'
      ? FractionTsUnitEnum.Years
      : (moment as TemporalLiteral).units === 'quarter'
        ? FractionTsUnitEnum.Quarters
        : (moment as TemporalLiteral).units === 'month'
          ? FractionTsUnitEnum.Months
          : (moment as TemporalLiteral).units === 'week'
            ? FractionTsUnitEnum.Weeks
            : (moment as TemporalLiteral).units === 'day' ||
                ['today', 'yesterday', 'tomorrow'].indexOf(
                  (moment as WhichdayMoment).moment
                ) > -1 ||
                [
                  'sunday',
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday'
                ].indexOf((moment as WeekdayMoment).moment) > -1
              ? FractionTsUnitEnum.Days
              : (moment as TemporalLiteral).units === 'hour'
                ? FractionTsUnitEnum.Hours
                : (moment as TemporalLiteral).units === 'minute'
                  ? FractionTsUnitEnum.Minutes
                  : undefined;

  let timeSpecUnit: FractionTsUnitEnum =
    timeSpec === TimeSpecEnum.Years
      ? FractionTsUnitEnum.Years
      : timeSpec === TimeSpecEnum.Quarters
        ? FractionTsUnitEnum.Quarters
        : timeSpec === TimeSpecEnum.Months
          ? FractionTsUnitEnum.Months
          : timeSpec === TimeSpecEnum.Weeks
            ? FractionTsUnitEnum.Weeks
            : timeSpec === TimeSpecEnum.Days
              ? FractionTsUnitEnum.Days
              : timeSpec === TimeSpecEnum.Hours
                ? FractionTsUnitEnum.Hours
                : timeSpec === TimeSpecEnum.Minutes
                  ? FractionTsUnitEnum.Minutes
                  : undefined;

  let momentCurrentUnitStartTs = getCurrentUnitStartTs({
    unit: momentUnit,
    timezone: timezone,
    weekStart: weekStart
  });

  let momentOneUnitDuration = getUnitDuration({
    value: 1,
    unit: momentUnit
  });

  let timeSpecOneUnitDuration = getUnitDuration({
    value: 1,
    unit: timeSpecUnit
  });

  let momentAgoFromNowDuration = getUnitDuration({
    value: agoFromNowQuantity,
    unit: momentUnit
  });

  let momentRangeStart =
    moment.moment === 'now'
      ? currentTs
      : moment.moment === 'literal' && isUndefined(moment.units)
        ? getUnixTime(new Date(moment.literal))
        : momentUnit === FractionTsUnitEnum.Days &&
            [
              'sunday',
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday'
            ].indexOf((moment as WeekdayMoment).moment) > -1
          ? getUnixTimeFromDayOfWeek({
              weekday: (moment as WeekdayMoment).moment,
              lastNext: (moment as WeekdayMoment).which,
              currentUnitStartTs: momentCurrentUnitStartTs
            })
          : momentUnit === FractionTsUnitEnum.Days && moment.moment === 'today'
            ? momentCurrentUnitStartTs
            : momentUnit === FractionTsUnitEnum.Days &&
                moment.moment === 'yesterday'
              ? getUnixTime(
                  sub(
                    fromUnixTime(momentCurrentUnitStartTs),
                    momentOneUnitDuration
                  )
                )
              : momentUnit === FractionTsUnitEnum.Days &&
                  moment.moment === 'tomorrow'
                ? getUnixTime(
                    add(
                      fromUnixTime(momentCurrentUnitStartTs),
                      momentOneUnitDuration
                    )
                  )
                : moment.moment === 'this'
                  ? momentCurrentUnitStartTs
                  : moment.moment === 'last'
                    ? getUnixTime(
                        sub(
                          fromUnixTime(momentCurrentUnitStartTs),
                          momentOneUnitDuration
                        )
                      )
                    : moment.moment === 'next'
                      ? getUnixTime(
                          add(
                            fromUnixTime(momentCurrentUnitStartTs),
                            momentOneUnitDuration
                          )
                        )
                      : moment.moment === 'ago'
                        ? getUnixTime(
                            sub(
                              fromUnixTime(momentCurrentUnitStartTs),
                              momentAgoFromNowDuration
                            )
                          )
                        : moment.moment === 'from_now'
                          ? getUnixTime(
                              add(
                                fromUnixTime(momentCurrentUnitStartTs),
                                momentAgoFromNowDuration
                              )
                            )
                          : moment.moment === 'literal'
                            ? getUnixTimeFromDateParts({
                                year: year,
                                month: month,
                                day: day,
                                hour: hour,
                                minute: minute
                              })
                            : undefined;

  let timeSpecMomentRangeStart = getTimeSpecUnitMomentStartTs({
    timeSpec: timeSpec,
    weekStart: weekStart,
    unixTime: momentRangeStart
  });

  let output: GetStartOutput = {
    timeSpecOneUnitDuration: timeSpecOneUnitDuration,
    timeSpecMomentRangeStart: timeSpecMomentRangeStart,
    momentRangeStart: momentRangeStart,
    momentUnit: momentUnit,
    momentOneUnitDuration: momentOneUnitDuration
  };

  return output;
}

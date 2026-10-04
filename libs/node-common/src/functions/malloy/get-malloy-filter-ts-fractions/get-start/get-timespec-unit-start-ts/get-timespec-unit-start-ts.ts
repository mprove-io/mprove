import {
  getUnixTime,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear
} from 'date-fns';
import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';
import type { TimeSpec } from '#common/types/shared/time/timespec';

export function getTimeSpecUnitStartTs(item: {
  timeSpec: TimeSpec;
  unixTime: number;
  weekStart: ProjectWeekStart;
}) {
  let { timeSpec, unixTime, weekStart } = item;

  let date = new Date(unixTime * 1000);

  let unitStartTs =
    timeSpec === 'timestamps'
      ? unixTime
      : timeSpec === 'years'
        ? getUnixTime(startOfYear(date))
        : timeSpec === 'quarters'
          ? getUnixTime(startOfQuarter(date))
          : timeSpec === 'months'
            ? getUnixTime(startOfMonth(date))
            : timeSpec === 'weeks'
              ? getUnixTime(
                  startOfWeek(date, {
                    weekStartsOn: weekStart === 'Sunday' ? 0 : 1
                  })
                )
              : timeSpec === 'days'
                ? getUnixTime(startOfDay(date))
                : timeSpec === 'hours'
                  ? getUnixTime(startOfHour(date))
                  : timeSpec === 'minutes'
                    ? getUnixTime(startOfMinute(date))
                    : unixTime;

  return unitStartTs;
}

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
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';

export function getTimeSpecUnitStartTs(item: {
  timeSpec: TimeSpecEnum;
  unixTime: number;
  weekStart: ProjectWeekStartEnum;
}) {
  let { timeSpec, unixTime, weekStart } = item;

  let date = new Date(unixTime * 1000);

  let unitStartTs =
    timeSpec === TimeSpecEnum.Timestamps
      ? unixTime
      : timeSpec === TimeSpecEnum.Years
        ? getUnixTime(startOfYear(date))
        : timeSpec === TimeSpecEnum.Quarters
          ? getUnixTime(startOfQuarter(date))
          : timeSpec === TimeSpecEnum.Months
            ? getUnixTime(startOfMonth(date))
            : timeSpec === TimeSpecEnum.Weeks
              ? getUnixTime(
                  startOfWeek(date, {
                    weekStartsOn:
                      weekStart === ProjectWeekStartEnum.Sunday ? 0 : 1
                  })
                )
              : timeSpec === TimeSpecEnum.Days
                ? getUnixTime(startOfDay(date))
                : timeSpec === TimeSpecEnum.Hours
                  ? getUnixTime(startOfHour(date))
                  : timeSpec === TimeSpecEnum.Minutes
                    ? getUnixTime(startOfMinute(date))
                    : unixTime;

  return unitStartTs;
}

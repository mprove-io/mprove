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
import { common } from '~node-common/barrels/common';

export function getTimeSpecUnitStartTs(item: {
  timeSpec: common.TimeSpecEnum;
  unixTime: number;
  weekStart: common.ProjectWeekStartEnum;
}) {
  let { timeSpec, unixTime, weekStart } = item;

  let date = new Date(unixTime * 1000);

  let unitStartTs =
    timeSpec === common.TimeSpecEnum.Timestamps
      ? unixTime
      : timeSpec === common.TimeSpecEnum.Years
        ? getUnixTime(startOfYear(date))
        : timeSpec === common.TimeSpecEnum.Quarters
          ? getUnixTime(startOfQuarter(date))
          : timeSpec === common.TimeSpecEnum.Months
            ? getUnixTime(startOfMonth(date))
            : timeSpec === common.TimeSpecEnum.Weeks
              ? getUnixTime(
                  startOfWeek(date, {
                    weekStartsOn:
                      weekStart === common.ProjectWeekStartEnum.Sunday ? 0 : 1
                  })
                )
              : timeSpec === common.TimeSpecEnum.Days
                ? getUnixTime(startOfDay(date))
                : timeSpec === common.TimeSpecEnum.Hours
                  ? getUnixTime(startOfHour(date))
                  : timeSpec === common.TimeSpecEnum.Minutes
                    ? getUnixTime(startOfMinute(date))
                    : unixTime;

  return unitStartTs;
}

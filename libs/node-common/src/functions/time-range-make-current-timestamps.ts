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
import { toZonedTime } from 'date-fns-tz';
import { common } from '~node-common/barrels/common';

export function timeRangeMakeCurrentTimestamps(item: {
  timezone: any;
  weekStart: any;
  getTimeRange: boolean;
}) {
  let { timezone, weekStart, getTimeRange } = item;

  let currentTimestamp: string;
  let currentMinuteTimestamp: string;
  let currentHourTimestamp: string;
  let currentDateTimestamp: string;
  let currentWeekStartTimestamp: string;
  let currentMonthTimestamp: string;
  let currentQuarterTimestamp: string;
  let currentYearTimestamp: string;

  if (getTimeRange === true) {
    let currentDateUTC = new Date();

    let currentDate = toZonedTime(currentDateUTC, timezone);

    currentTimestamp = getUnixTime(currentDate).toString();

    currentMinuteTimestamp = getUnixTime(startOfMinute(currentDate)).toString();

    currentHourTimestamp = getUnixTime(startOfHour(currentDate)).toString();

    currentDateTimestamp = getUnixTime(startOfDay(currentDate)).toString();

    currentWeekStartTimestamp = getUnixTime(
      startOfWeek(currentDate, {
        weekStartsOn: weekStart === common.ProjectWeekStartEnum.Sunday ? 0 : 1
      })
    ).toString();

    currentMonthTimestamp = getUnixTime(startOfMonth(currentDate)).toString();

    currentQuarterTimestamp = getUnixTime(
      startOfQuarter(currentDate)
    ).toString();

    currentYearTimestamp = getUnixTime(startOfYear(currentDate)).toString();
  }

  return {
    currentTs: currentTimestamp,
    currentMinuteTs: currentMinuteTimestamp,
    currentHourTs: currentHourTimestamp,
    currentDateTs: currentDateTimestamp,
    currentWeekStartTs: currentWeekStartTimestamp,
    currentMonthTs: currentMonthTimestamp,
    currentQuarterTs: currentQuarterTimestamp,
    currentYearTs: currentYearTimestamp
  };
}

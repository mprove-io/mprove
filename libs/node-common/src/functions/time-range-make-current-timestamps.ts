import {
  getUnixTime,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfQuarter,
  startOfSecond,
  startOfWeek,
  startOfYear
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { common } from '~node-common/barrels/common';

export function timeRangeMakeCurrentTimestamps(item: {
  timezone: any;
  weekStart: any;
}) {
  let { timezone, weekStart } = item;

  let currentDateUTC = new Date();

  let currentDate = toZonedTime(currentDateUTC, timezone);

  let currentTimestamp = getUnixTime(currentDate).toString();

  let currentSecondTimestamp = getUnixTime(
    startOfSecond(currentDate)
  ).toString();

  let currentMinuteTimestamp = getUnixTime(
    startOfMinute(currentDate)
  ).toString();

  let currentHourTimestamp = getUnixTime(startOfHour(currentDate)).toString();

  let currentDateTimestamp = getUnixTime(startOfDay(currentDate)).toString();

  let currentWeekStartTimestamp = getUnixTime(
    startOfWeek(currentDate, {
      weekStartsOn: weekStart === common.ProjectWeekStartEnum.Sunday ? 0 : 1
    })
  ).toString();

  let currentMonthTimestamp = getUnixTime(startOfMonth(currentDate)).toString();

  let currentQuarterTimestamp = getUnixTime(
    startOfQuarter(currentDate)
  ).toString();

  let currentYearTimestamp = getUnixTime(startOfYear(currentDate)).toString();

  return {
    currentTs: currentTimestamp,
    currentSecondTs: currentSecondTimestamp,
    currentMinuteTs: currentMinuteTimestamp,
    currentHourTs: currentHourTimestamp,
    currentDateTs: currentDateTimestamp,
    currentWeekStartTs: currentWeekStartTimestamp,
    currentMonthTs: currentMonthTimestamp,
    currentQuarterTs: currentQuarterTimestamp,
    currentYearTs: currentYearTimestamp
  };
}

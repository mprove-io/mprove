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

interface TimestampsResult {
  currentTs: number;
  currentSecondTs: number;
  currentMinuteTs: number;
  currentHourTs: number;
  currentDateTs: number;
  currentWeekStartTs: number;
  currentMonthTs: number;
  currentQuarterTs: number;
  currentYearTs: number;
}

export function timeRangeMakeCurrentTimestamps(item: {
  timezone: any;
  weekStart: any;
}): TimestampsResult {
  let { timezone, weekStart } = item;

  let currentDateUTC = new Date();

  let currentDate = toZonedTime(currentDateUTC, timezone);

  let currentTimestamp = getUnixTime(currentDate);

  let currentSecondTimestamp = getUnixTime(startOfSecond(currentDate));

  let currentMinuteTimestamp = getUnixTime(startOfMinute(currentDate));

  let currentHourTimestamp = getUnixTime(startOfHour(currentDate));

  let currentDateTimestamp = getUnixTime(startOfDay(currentDate));

  // console.log('weekStart');
  // console.log(weekStart);

  let currentWeekStartTimestamp = getUnixTime(
    startOfWeek(currentDate, {
      weekStartsOn: weekStart === common.ProjectWeekStartEnum.Sunday ? 0 : 1
    })
  );

  // console.log('currentWeekStartTimestamp');
  // console.log(currentWeekStartTimestamp);

  let currentMonthTimestamp = getUnixTime(startOfMonth(currentDate));

  let currentQuarterTimestamp = getUnixTime(startOfQuarter(currentDate));

  let currentYearTimestamp = getUnixTime(startOfYear(currentDate));

  let currentTimestampsResult: TimestampsResult = {
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

  return currentTimestampsResult;
}

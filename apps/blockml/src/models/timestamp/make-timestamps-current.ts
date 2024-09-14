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
import { common } from '~blockml/barrels/common';

export function makeTimestampsCurrent(item: {
  connection: common.ProjectConnection;
  timezone: any;
  weekStart: any;
  getTimeRange: boolean;
}) {
  let { connection, timezone, weekStart, getTimeRange } = item;

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

    // console.log('timezone');
    // console.log(timezone);
    // console.log('timezone diff in seconds');
    // console.log(getUnixTime(currentDateUTC) - getUnixTime(currentDate));

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
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        currentTimestamp =
          timezone === common.UTC
            ? 'CURRENT_TIMESTAMP()'
            : `TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), '${timezone}'))`;

        currentMinuteTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, MINUTE)`;
        currentHourTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, HOUR)`;
        currentDateTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, DAY)`;

        currentWeekStartTimestamp =
          weekStart === common.ProjectWeekStartEnum.Sunday
            ? `TIMESTAMP_TRUNC(${currentTimestamp}, WEEK)`
            : `TIMESTAMP_ADD(TIMESTAMP_TRUNC(${currentTimestamp}, WEEK), INTERVAL 1 DAY)`;

        currentMonthTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, MONTH)`;
        currentQuarterTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, QUARTER)`;
        currentYearTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, YEAR)`;
        break;
      }

      case common.ConnectionTypeEnum.PostgreSQL: {
        currentTimestamp =
          timezone === common.UTC
            ? 'CURRENT_TIMESTAMP'
            : `TIMEZONE('${timezone}', CURRENT_TIMESTAMP::TIMESTAMPTZ)`;

        currentMinuteTimestamp = `DATE_TRUNC('minute', ${currentTimestamp})`;
        currentHourTimestamp = `DATE_TRUNC('hour', ${currentTimestamp})`;
        currentDateTimestamp = `DATE_TRUNC('day', ${currentTimestamp})`;

        currentWeekStartTimestamp =
          weekStart === common.ProjectWeekStartEnum.Sunday
            ? `DATE_TRUNC('week', ${currentTimestamp}) + INTERVAL '-1 day'`
            : `DATE_TRUNC('week', ${currentTimestamp})`;

        currentMonthTimestamp = `DATE_TRUNC('month', ${currentTimestamp})`;
        currentQuarterTimestamp = `DATE_TRUNC('quarter', ${currentTimestamp})`;
        currentYearTimestamp = `DATE_TRUNC('year', ${currentTimestamp})`;
        break;
      }

      case common.ConnectionTypeEnum.ClickHouse: {
        currentTimestamp =
          timezone === common.UTC ? 'now()' : `now('${timezone}')`;

        currentMinuteTimestamp = `toStartOfMinute(${currentTimestamp})`;
        currentHourTimestamp = `toStartOfHour(${currentTimestamp})`;
        currentDateTimestamp = `toStartOfDay(${currentTimestamp})`;

        currentWeekStartTimestamp =
          weekStart === common.ProjectWeekStartEnum.Sunday
            ? `toStartOfWeek(${currentTimestamp}, 6)`
            : `toStartOfWeek(${currentTimestamp}, 3)`;

        currentMonthTimestamp = `toStartOfMonth(${currentTimestamp})`;
        currentQuarterTimestamp = `toStartOfQuarter(${currentTimestamp})`;
        currentYearTimestamp = `toStartOfYear(${currentTimestamp})`;
        break;
      }

      case common.ConnectionTypeEnum.SnowFlake: {
        currentTimestamp =
          timezone === common.UTC
            ? 'CAST(CURRENT_TIMESTAMP() AS TIMESTAMP_NTZ)'
            : `CONVERT_TIMEZONE('UTC', '${timezone}',  CAST(CURRENT_TIMESTAMP() AS TIMESTAMP_NTZ))`;

        currentMinuteTimestamp = `DATE_TRUNC('minute', ${currentTimestamp})`;
        currentHourTimestamp = `DATE_TRUNC('hour', ${currentTimestamp})`;
        currentDateTimestamp = `DATE_TRUNC('day', ${currentTimestamp})`;

        currentWeekStartTimestamp =
          weekStart === common.ProjectWeekStartEnum.Sunday
            ? `DATE_TRUNC('week', ${currentTimestamp}) + INTERVAL '-1 day'`
            : `DATE_TRUNC('week', ${currentTimestamp})`;

        currentMonthTimestamp = `DATE_TRUNC('month', ${currentTimestamp})`;
        currentQuarterTimestamp = `DATE_TRUNC('quarter', ${currentTimestamp})`;
        currentYearTimestamp = `DATE_TRUNC('year', ${currentTimestamp})`;
        break;
      }
    }
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

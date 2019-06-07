import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimestampsCurrent(item: {
  connection: api.ProjectConnectionEnum;
  timezone: any;
  week_start: any;
}) {
  let currentTimestamp;
  let currentMinuteTimestamp;
  let currentHourTimestamp;
  let currentDateTimestamp;
  let currentWeekStartTimestamp;
  let currentMonthTimestamp;
  let currentQuarterTimestamp;
  let currentYearTimestamp;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    currentTimestamp =
      item.timezone === 'UTC'
        ? `CURRENT_TIMESTAMP()`
        : `TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), '${
            item.timezone
          }'))`;

    currentMinuteTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, MINUTE)`;
    currentHourTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, HOUR)`;
    currentDateTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, DAY)`;

    currentWeekStartTimestamp =
      item.week_start === api.ProjectWeekStartEnum.Sunday
        ? `TIMESTAMP_TRUNC(${currentTimestamp}, WEEK)`
        : `TIMESTAMP_ADD(TIMESTAMP_TRUNC(${currentTimestamp}, WEEK), INTERVAL 1 DAY)`;

    currentMonthTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, MONTH)`;
    currentQuarterTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, QUARTER)`;
    currentYearTimestamp = `TIMESTAMP_TRUNC(${currentTimestamp}, YEAR)`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    currentTimestamp =
      item.timezone === 'UTC'
        ? `CURRENT_TIMESTAMP`
        : `TIMEZONE('${item.timezone}', CURRENT_TIMESTAMP::TIMESTAMPTZ)`;

    currentMinuteTimestamp = `DATE_TRUNC('minute', ${currentTimestamp})`;
    currentHourTimestamp = `DATE_TRUNC('hour', ${currentTimestamp})`;
    currentDateTimestamp = `DATE_TRUNC('day', ${currentTimestamp})`;

    currentWeekStartTimestamp =
      item.week_start === api.ProjectWeekStartEnum.Sunday
        ? `DATE_TRUNC('week', ${currentTimestamp}) + INTERVAL '-1 day'`
        : `DATE_TRUNC('week', ${currentTimestamp})`;

    currentMonthTimestamp = `DATE_TRUNC('month', ${currentTimestamp})`;
    currentQuarterTimestamp = `DATE_TRUNC('quarter', ${currentTimestamp})`;
    currentYearTimestamp = `DATE_TRUNC('year', ${currentTimestamp})`;
  }

  return {
    current_ts: currentTimestamp,
    current_minute_ts: currentMinuteTimestamp,
    current_hour_ts: currentHourTimestamp,
    current_date_ts: currentDateTimestamp,
    current_week_start_ts: currentWeekStartTimestamp,
    current_month_ts: currentMonthTimestamp,
    current_quarter_ts: currentQuarterTimestamp,
    current_year_ts: currentYearTimestamp
  };
}

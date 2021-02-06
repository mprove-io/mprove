import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

export function makeTimestampsCurrent(item: {
  connection: common.ProjectConnection;
  timezone: any;
  weekStart: any;
}) {
  let { connection, timezone, weekStart } = item;

  let currentTimestamp;
  let currentMinuteTimestamp;
  let currentHourTimestamp;
  let currentDateTimestamp;
  let currentWeekStartTimestamp;
  let currentMonthTimestamp;
  let currentQuarterTimestamp;
  let currentYearTimestamp;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      currentTimestamp =
        timezone === constants.UTC
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
        timezone === constants.UTC
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

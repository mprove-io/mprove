import { common } from '~blockml/barrels/common';

export function makeTimestampWeek(item: {
  currentTimestamp: string;
  connection: common.ProjectConnection;
  weekStart: common.ProjectWeekStartEnum;
}) {
  let { currentTimestamp, connection, weekStart } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql =
        weekStart === common.ProjectWeekStartEnum.Sunday
          ? `TIMESTAMP_TRUNC(${currentTimestamp}, WEEK)`
          : `TIMESTAMP_ADD(TIMESTAMP_TRUNC(${currentTimestamp}, WEEK), INTERVAL 1 DAY)`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql =
        weekStart === common.ProjectWeekStartEnum.Sunday
          ? `DATE_TRUNC('week', ${currentTimestamp}) + INTERVAL '-1 day'`
          : `DATE_TRUNC('week', ${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql =
        weekStart === common.ProjectWeekStartEnum.Sunday
          ? `toStartOfWeek(${currentTimestamp}, 6)`
          : `toStartOfWeek(${currentTimestamp}, 3)`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql =
        weekStart === common.ProjectWeekStartEnum.Sunday
          ? `DATE_TRUNC('week', ${currentTimestamp}) + INTERVAL '-1 day'`
          : `DATE_TRUNC('week', ${currentTimestamp})`;
      break;
    }
  }

  return sql;
}

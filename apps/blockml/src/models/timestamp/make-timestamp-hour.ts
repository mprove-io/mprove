import { common } from '~blockml/barrels/common';

export function makeTimestampHour(item: {
  currentTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { currentTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `TIMESTAMP_TRUNC(${currentTimestamp}, HOUR)`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `DATE_TRUNC('hour', ${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toStartOfHour(${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `DATE_TRUNC('hour', ${currentTimestamp})`;
      break;
    }
  }

  return sql;
}

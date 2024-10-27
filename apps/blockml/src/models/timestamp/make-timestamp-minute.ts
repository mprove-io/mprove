import { common } from '~blockml/barrels/common';

export function makeTimestampMinute(item: {
  currentTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { currentTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `TIMESTAMP_TRUNC(${currentTimestamp}, MINUTE)`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `DATE_TRUNC('minute', ${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toStartOfMinute(${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `DATE_TRUNC('minute', ${currentTimestamp})`;
      break;
    }
  }

  return sql;
}

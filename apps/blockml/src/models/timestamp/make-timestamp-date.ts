import { common } from '~blockml/barrels/common';

export function makeTimestampDate(item: {
  currentTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { currentTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `TIMESTAMP_TRUNC(${currentTimestamp}, DAY)`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `DATE_TRUNC('day', ${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toStartOfDay(${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `DATE_TRUNC('day', ${currentTimestamp})`;
      break;
    }
  }

  return sql;
}

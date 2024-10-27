import { common } from '~blockml/barrels/common';

export function makeTimestampYear(item: {
  currentTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { currentTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `TIMESTAMP_TRUNC(${currentTimestamp}, YEAR)`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `DATE_TRUNC('year', ${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toStartOfYear(${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `DATE_TRUNC('year', ${currentTimestamp})`;
      break;
    }
  }

  return sql;
}

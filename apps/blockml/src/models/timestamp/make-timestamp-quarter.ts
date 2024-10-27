import { common } from '~blockml/barrels/common';

export function makeTimestampQuarter(item: {
  currentTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { currentTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `TIMESTAMP_TRUNC(${currentTimestamp}, QUARTER)`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `DATE_TRUNC('quarter', ${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toStartOfQuarter(${currentTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `DATE_TRUNC('quarter', ${currentTimestamp})`;
      break;
    }
  }

  return sql;
}

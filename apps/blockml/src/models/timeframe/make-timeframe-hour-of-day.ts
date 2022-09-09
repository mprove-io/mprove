import { common } from '~blockml/barrels/common';

export function makeTimeframeHourOfDay(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `EXTRACT(HOUR FROM ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `EXTRACT(HOUR FROM ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toHour(toDateTime(${sqlTimestamp}))`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `EXTRACT(HOUR FROM ${sqlTimestamp})`;
      break;
    }
  }

  return sql;
}

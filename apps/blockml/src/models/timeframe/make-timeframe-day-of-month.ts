import { common } from '~blockml/barrels/common';

export function makeTimeframeDayOfMonth(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `EXTRACT(DAY FROM ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `EXTRACT(DAY FROM ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toDayOfMonth(${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `EXTRACT(DAY FROM ${sqlTimestamp})::integer`;
      break;
    }
  }

  return sql;
}

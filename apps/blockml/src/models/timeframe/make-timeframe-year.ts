import { common } from '~blockml/barrels/common';

export function makeTimeframeYear(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `EXTRACT(YEAR FROM ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `DATE_PART('year', ${sqlTimestamp})::INTEGER`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toYear(${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `EXTRACT(YEAR FROM ${sqlTimestamp})`;
      break;
    }
  }

  return sql;
}

import { common } from '~blockml/barrels/common';

export function makeTimeframeMonthNum(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `EXTRACT(MONTH FROM ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `DATE_PART('month', ${sqlTimestamp})::INTEGER`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toMonth(${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `EXTRACT(MONTH FROM ${sqlTimestamp})`;
      break;
    }
  }

  return sql;
}

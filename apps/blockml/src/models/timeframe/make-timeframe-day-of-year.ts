import { common } from '~blockml/barrels/common';

export function makeTimeframeDayOfYear(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `EXTRACT(DAYOFYEAR FROM ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `EXTRACT(DOY FROM ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toDayOfYear(${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `EXTRACT(DOY FROM ${sqlTimestamp})`;
      break;
    }
  }

  return sql;
}

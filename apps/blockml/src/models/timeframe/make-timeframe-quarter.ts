import { common } from '~blockml/barrels/common';

export function makeTimeframeQuarter(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%Y-%m', TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), QUARTER))`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('month', DATE_TRUNC('quarter', ${sqlTimestamp})), 'YYYY-MM')`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `formatDateTime(toStartOfQuarter(${sqlTimestamp}), '%Y-%m')`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `TO_CHAR(DATE_TRUNC('month', CAST(DATE_TRUNC('quarter', ${sqlTimestamp}) AS DATE)), 'YYYY-MM')`;
      break;
    }
  }

  return sql;
}

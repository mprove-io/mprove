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
  }

  return sql;
}

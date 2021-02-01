import { api } from '~blockml/barrels/api';

export function makeTimeframeQuarter(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%Y-%m', TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), QUARTER))`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('month', DATE_TRUNC('quarter', ${sqlTimestamp})), 'YYYY-MM')`;
      break;
    }
  }

  return sql;
}

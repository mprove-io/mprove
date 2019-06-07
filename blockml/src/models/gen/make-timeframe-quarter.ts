import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeQuarter(item: {
  sql_timestamp: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = `FORMAT_TIMESTAMP('%Y-%m', TIMESTAMP_TRUNC(CAST(${
      item.sql_timestamp
    } AS TIMESTAMP), QUARTER))`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `TO_CHAR(DATE_TRUNC('month', DATE_TRUNC('quarter', ${
      item.sql_timestamp
    })), 'YYYY-MM')`;
  }

  return sql;
}

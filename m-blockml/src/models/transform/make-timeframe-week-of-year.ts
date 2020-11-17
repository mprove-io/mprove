import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeWeekOfYear(item: {
  sql_timestamp: string;
  week_start: api.ProjectWeekStartEnum;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql =
      item.week_start === api.ProjectWeekStartEnum.Sunday
        ? `CAST(FORMAT_TIMESTAMP('%V', ${item.sql_timestamp}) AS INT64)`
        : `CASE
WHEN EXTRACT(DAYOFWEEK FROM TIMESTAMP_TRUNC(CAST(${item.sql_timestamp} AS TIMESTAMP), YEAR)) = 1 THEN ` +
          `(CASE WHEN EXTRACT(DAYOFWEEK FROM ${item.sql_timestamp}) = 1 THEN ` +
          `CAST(FORMAT_TIMESTAMP('%V', ${item.sql_timestamp}) AS INT64) ELSE ` +
          `CAST(FORMAT_TIMESTAMP('%V', ${item.sql_timestamp}) AS INT64) + 1 END)
ELSE (CASE WHEN EXTRACT(DAYOFWEEK FROM ${item.sql_timestamp}) = 1 THEN ` +
          `CAST(FORMAT_TIMESTAMP('%V', ${item.sql_timestamp}) AS INT64) - 1 ELSE ` +
          `CAST(FORMAT_TIMESTAMP('%V', ${item.sql_timestamp}) AS INT64) END)
END`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `EXTRACT(WEEK from ${item.sql_timestamp})`;
  }

  return sql;
}

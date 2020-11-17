import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeDate(item: {
  sql_timestamp: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = `CAST(CAST(${item.sql_timestamp} AS DATE) AS STRING)`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `SUBSTRING((${item.sql_timestamp})::TEXT FROM 1 FOR 10)`;
  }

  return sql;
}

import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeYear(item: {
  sql_timestamp: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = `EXTRACT(YEAR FROM ${item.sql_timestamp})`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `DATE_PART('year', ${item.sql_timestamp})::INTEGER`;
  }

  return sql;
}

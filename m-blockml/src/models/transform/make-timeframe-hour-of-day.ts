import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeHourOfDay(item: {
  sql_timestamp: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = `EXTRACT(HOUR FROM ${item.sql_timestamp})`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `EXTRACT(HOUR FROM ${item.sql_timestamp})`;
  }

  return sql;
}

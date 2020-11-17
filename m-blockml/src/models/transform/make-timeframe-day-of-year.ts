import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeDayOfYear(item: {
  sql_timestamp: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = `EXTRACT(DAYOFYEAR FROM ${item.sql_timestamp})`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `EXTRACT(DOY FROM ${item.sql_timestamp})`;
  }

  return sql;
}

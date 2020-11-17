import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeMinute(item: {
  sql_timestamp: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = `FORMAT_TIMESTAMP('%F %H:%M', ${item.sql_timestamp})`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `TO_CHAR(DATE_TRUNC('minute', ${item.sql_timestamp}), 'YYYY-MM-DD HH24:MI')`;
  }

  return sql;
}

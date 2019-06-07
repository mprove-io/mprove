import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeTime(item: {
  sql_timestamp: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = `FORMAT_TIMESTAMP('%F %T', ${item.sql_timestamp})`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `TO_CHAR(${item.sql_timestamp}, 'YYYY-MM-DD HH24:MI:SS')`;
  }

  return sql;
}

import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeHourNum(item: {
  sql_timestamp: string;
  num: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql =
      `FORMAT_TIMESTAMP('%F %H', ` +
      `TIMESTAMP_TRUNC(TIMESTAMP_ADD(${item.sql_timestamp}, INTERVAL ` +
      `MOD(-1 * EXTRACT(HOUR FROM ${item.sql_timestamp}), ${item.num}) HOUR), HOUR))`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `TO_CHAR(DATE_TRUNC('hour', DATE_TRUNC('hour', ${item.sql_timestamp} - (DATE_PART('hour', ${item.sql_timestamp})::INT % ${item.num} || 'HOURS')::INTERVAL)), 'YYYY-MM-DD HH24')`;
  }

  return sql;
}

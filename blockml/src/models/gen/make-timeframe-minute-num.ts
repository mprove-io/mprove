import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeMinuteNum(item: {
  sql_timestamp: string;
  num: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql =
      `FORMAT_TIMESTAMP('%F %H:%M', ` +
      `TIMESTAMP_TRUNC(TIMESTAMP_SECONDS((UNIX_SECONDS(${
        item.sql_timestamp
      }) - MOD(UNIX_SECONDS(${item.sql_timestamp}), (60*${
        item.num
      })))), MINUTE))`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `TO_CHAR(DATE_TRUNC('minute', DATE_TRUNC('minute', (timestamp 'epoch' + (DATE_PART('epoch', ${
      item.sql_timestamp
    })::bigint - (DATE_PART('epoch', ${item.sql_timestamp})::bigint % (60*${
      item.num
    }))) * interval '1 second'))), 'YYYY-MM-DD HH24:MI')`;
  }

  return sql;
}

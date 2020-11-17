import { api } from '../../barrels/api';

export function makeTimeframeMinuteNum(item: {
  num: string;
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection, num } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%F %H:%M', TIMESTAMP_TRUNC(TIMESTAMP_SECONDS((UNIX_SECONDS(${sqlTimestamp}) - MOD(UNIX_SECONDS(${sqlTimestamp}), (60*${num})))), MINUTE))`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('minute', DATE_TRUNC('minute', (timestamp 'epoch' + (DATE_PART('epoch', ${sqlTimestamp})::bigint - (DATE_PART('epoch', ${sqlTimestamp})::bigint % (60*${num}))) * interval '1 second'))), 'YYYY-MM-DD HH24:MI')`;
      break;
    }
  }

  return sql;
}

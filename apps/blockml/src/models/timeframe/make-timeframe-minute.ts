import { common } from '~blockml/barrels/common';

export function makeTimeframeMinute(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%F %H:%M', ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('minute', ${sqlTimestamp}), 'YYYY-MM-DD HH24:MI')`;
      break;
    }
  }

  return sql;
}

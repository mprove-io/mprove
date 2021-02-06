import { common } from '~blockml/barrels/common';

export function makeTimeframeHour(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%F %H', ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('hour', ${sqlTimestamp}), 'YYYY-MM-DD HH24')`;
      break;
    }
  }

  return sql;
}

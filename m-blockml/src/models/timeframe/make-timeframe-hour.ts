import { api } from '~/barrels/api';

export function makeTimeframeHour(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%F %H', ${sqlTimestamp})`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('hour', ${sqlTimestamp}), 'YYYY-MM-DD HH24')`;
      break;
    }
  }

  return sql;
}

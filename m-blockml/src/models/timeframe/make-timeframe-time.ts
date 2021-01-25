import { api } from '~/barrels/api';

export function makeTimeframeTime(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%F %T', ${sqlTimestamp})`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(${sqlTimestamp}, 'YYYY-MM-DD HH24:MI:SS')`;
      break;
    }
  }

  return sql;
}

import { api } from '~/barrels/api';

export function makeTimeframeTimeOfDay(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%H:%M', ${sqlTimestamp})`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(${sqlTimestamp}, 'HH24:MI')`;
      break;
    }
  }

  return sql;
}

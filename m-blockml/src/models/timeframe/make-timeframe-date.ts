import { api } from '~/barrels/api';

export function makeTimeframeDate(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `CAST(CAST(${sqlTimestamp} AS DATE) AS STRING)`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `SUBSTRING((${sqlTimestamp})::TEXT FROM 1 FOR 10)`;
      break;
    }
  }

  return sql;
}

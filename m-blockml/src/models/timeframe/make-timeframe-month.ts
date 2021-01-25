import { api } from '~/barrels/api';

export function makeTimeframeMonth(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%Y-%m', ${sqlTimestamp})`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('month', ${sqlTimestamp}), 'YYYY-MM')`;
      break;
    }
  }

  return sql;
}

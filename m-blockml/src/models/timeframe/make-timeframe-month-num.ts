import { api } from '~/barrels/api';

export function makeTimeframeMonthNum(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `EXTRACT(MONTH FROM ${sqlTimestamp})`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `DATE_PART('month', ${sqlTimestamp})::INTEGER`;
      break;
    }
  }

  return sql;
}

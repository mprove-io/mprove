import { api } from '../../barrels/api';

export function makeTimeframeYear(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `EXTRACT(YEAR FROM ${sqlTimestamp})`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `DATE_PART('year', ${sqlTimestamp})::INTEGER`;
      break;
    }
  }

  return sql;
}

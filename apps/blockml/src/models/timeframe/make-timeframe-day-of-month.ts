import { api } from '~blockml/barrels/api';

export function makeTimeframeDayOfMonth(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `EXTRACT(DAY FROM ${sqlTimestamp})`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `EXTRACT(DAY FROM ${sqlTimestamp})`;
      break;
    }
  }

  return sql;
}

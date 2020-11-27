import { api } from '../../barrels/api';

export function makeTimeframeDayOfYear(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `EXTRACT(DAYOFYEAR FROM ${sqlTimestamp})`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `EXTRACT(DOY FROM ${sqlTimestamp})`;
      break;
    }
  }

  return sql;
}

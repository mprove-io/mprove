import { api } from '~blockml/barrels/api';

export function makeTimeframeHourOfDay(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `EXTRACT(HOUR FROM ${sqlTimestamp})`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `EXTRACT(HOUR FROM ${sqlTimestamp})`;
      break;
    }
  }

  return sql;
}

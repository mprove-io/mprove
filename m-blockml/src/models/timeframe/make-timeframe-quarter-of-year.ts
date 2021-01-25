import { api } from '~/barrels/api';

export function makeTimeframeQuarterOfYear(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `CONCAT(CAST('Q' AS STRING), CAST(EXTRACT(QUARTER FROM ${sqlTimestamp}) AS STRING))`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `CAST('Q' AS VARCHAR) || CAST(EXTRACT(QUARTER FROM ${sqlTimestamp})::integer AS VARCHAR)`;
      break;
    }
  }

  return sql;
}

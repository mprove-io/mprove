import { api } from '../../barrels/api';

export function makeTsFromSourceYYYYMMDD(item: {
  sql: string;
  connection: api.ProjectConnection;
}) {
  let { sql, connection } = item;

  let ts;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      ts = `PARSE_TIMESTAMP('%Y%m%d', CAST(${sql} AS STRING))`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      ts = `TO_DATE(${sql}::VARCHAR, 'YYYYMMDD')::TIMESTAMP`;
      break;
    }
  }

  return ts;
}

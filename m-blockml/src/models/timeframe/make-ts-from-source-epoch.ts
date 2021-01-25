import { api } from '~/barrels/api';

export function makeTsFromSourceEpoch(item: {
  sql: string;
  connection: api.ProjectConnection;
}) {
  let { sql, connection } = item;

  let ts;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      ts = `TIMESTAMP_SECONDS(${sql})`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      ts = `TIMESTAMP 'epoch' + (${sql}) * INTERVAL '1 second'`;
      break;
    }
  }

  return ts;
}

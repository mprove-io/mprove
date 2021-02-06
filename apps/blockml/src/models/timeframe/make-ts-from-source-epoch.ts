import { common } from '~blockml/barrels/common';

export function makeTsFromSourceEpoch(item: {
  sql: string;
  connection: common.ProjectConnection;
}) {
  let { sql, connection } = item;

  let ts;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      ts = `TIMESTAMP_SECONDS(${sql})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      ts = `TIMESTAMP 'epoch' + (${sql}) * INTERVAL '1 second'`;
      break;
    }
  }

  return ts;
}

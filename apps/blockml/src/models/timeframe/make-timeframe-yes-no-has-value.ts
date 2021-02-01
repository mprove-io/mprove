import { api } from '~blockml/barrels/api';

export function makeTimeframeYesNoHasValue(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = `CASE WHEN (${sqlTimestamp}) IS NOT NULL THEN 'Yes' ELSE 'No' END`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `CASE WHEN (${sqlTimestamp}) IS NOT NULL THEN 'Yes' ELSE 'No' END`;
      break;
    }
  }

  return sql;
}

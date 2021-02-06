import { common } from '~blockml/barrels/common';

export function makeTimeframeYesNoHasValue(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `CASE WHEN (${sqlTimestamp}) IS NOT NULL THEN 'Yes' ELSE 'No' END`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `CASE WHEN (${sqlTimestamp}) IS NOT NULL THEN 'Yes' ELSE 'No' END`;
      break;
    }
  }

  return sql;
}

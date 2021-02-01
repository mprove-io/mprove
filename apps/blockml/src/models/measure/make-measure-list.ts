import { api } from '~blockml/barrels/api';

export function makeMeasureList(item: {
  sqlFinal: string;
  connection: api.ProjectConnection;
}) {
  let { connection, sqlFinal } = item;

  let sqlSelect;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sqlSelect = `STRING_AGG(DISTINCT CAST(${sqlFinal} AS STRING), ', ')`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sqlSelect = `STRING_AGG(DISTINCT CAST(${sqlFinal} AS TEXT), ', ')`;
      break;
    }
  }

  return sqlSelect;
}

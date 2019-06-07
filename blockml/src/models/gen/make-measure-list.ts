import { api } from '../../barrels/api';

export function makeMeasureList(item: {
  sql_final: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sqlSelect;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sqlSelect = `STRING_AGG(DISTINCT CAST(${item.sql_final} AS STRING), ', ')`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sqlSelect = `STRING_AGG(DISTINCT CAST(${item.sql_final} AS TEXT), ', ')`;
  }

  return sqlSelect;
}

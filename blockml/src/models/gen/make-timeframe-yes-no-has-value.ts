import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeYesNoHasValue(item: {
  sql_timestamp: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = `CASE
      WHEN (${item.sql_timestamp}) IS NOT NULL THEN 'Yes'
      ELSE 'No'
    END`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `CASE
      WHEN (${item.sql_timestamp}) IS NOT NULL THEN 'Yes'
      ELSE 'No'
    END`;
  }

  return sql;
}

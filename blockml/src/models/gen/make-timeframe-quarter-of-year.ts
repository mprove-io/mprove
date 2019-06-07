import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeQuarterOfYear(item: {
  sql_timestamp: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = `CONCAT(CAST('Q' AS STRING), CAST(EXTRACT(QUARTER FROM ${
      item.sql_timestamp
    }) AS STRING))`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `CAST('Q' AS VARCHAR) || CAST(EXTRACT(QUARTER FROM ${
      item.sql_timestamp
    })::integer AS VARCHAR)`;
  }

  return sql;
}

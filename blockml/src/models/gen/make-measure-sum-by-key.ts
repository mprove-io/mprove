import { api } from '../../barrels/api';

export function makeMeasureSumByKey(item: {
  sql_key_final: string;
  sql_final: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sqlSelect;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sqlSelect =
      `COALESCE(mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(` +
      item.sql_key_final +
      ` AS STRING), '||'), CAST(` +
      item.sql_final +
      ` AS STRING)))), 0)`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    let val =
      `CAST(FLOOR(COALESCE(` +
      item.sql_final +
      `, 0)*(1000000*1.0)) AS DECIMAL(38,0))`;

    let left =
      `CAST(('x' || lpad(LEFT(MD5(CAST(` +
      item.sql_key_final +
      ` AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8`;

    let right =
      `CAST(('x' || lpad(RIGHT(MD5(CAST(` +
      item.sql_key_final +
      ` AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))`;

    sqlSelect = `COALESCE(COALESCE(CAST((SUM(DISTINCT ${val} + ${left} + ${right}) - SUM(DISTINCT ${left} + ${right})) AS DOUBLE PRECISION) / CAST((1000000*1.0) AS DOUBLE PRECISION), 0), 0)`;
  }

  return sqlSelect;
}

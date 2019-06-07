import { api } from '../../barrels/api';

export function makeMeasureAverageByKey(item: {
  sql_key_final: string;
  sql_final: string;
  connection: api.ProjectConnectionEnum;
}) {
  let numerator;
  let denominator;
  let sqlSelect;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    numerator =
      `mprove_array_sum(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(` +
      item.sql_key_final +
      ` AS STRING), '||'), CAST(` +
      item.sql_final +
      ` AS STRING))))`;

    denominator =
      `NULLIF(CAST(COUNT(DISTINCT CASE WHEN ` +
      item.sql_final +
      ` IS NOT NULL THEN ` +
      item.sql_key_final +
      ` ELSE NULL END) AS FLOAT64), 0.0)`;

    sqlSelect = `(${numerator} / ${denominator})`;
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

    numerator = `COALESCE(CAST((SUM(DISTINCT ${val} + ${left} + ${right}) - SUM(DISTINCT ${left} + ${right})) AS DOUBLE PRECISION) / CAST((1000000*1.0) AS DOUBLE PRECISION), 0)`;

    denominator =
      `NULLIF(COUNT(DISTINCT CASE WHEN ` +
      item.sql_final +
      ` IS NOT NULL THEN ` +
      item.sql_key_final +
      ` ELSE NULL END), 0)`;

    sqlSelect = `(${numerator} / ${denominator})`;
  }

  return sqlSelect;
}

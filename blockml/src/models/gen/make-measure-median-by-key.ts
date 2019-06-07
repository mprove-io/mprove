import { api } from '../../barrels/api';

export function makeMeasureMedianByKey(item: {
  sql_key_final: string;
  sql_final: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sqlSelect =
    `mprove_approx_percentile_distinct_disc(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(` +
    item.sql_key_final +
    ` AS STRING), '||'), CAST(` +
    item.sql_final +
    ` AS STRING))), 0.5)`;

  return sqlSelect;
}

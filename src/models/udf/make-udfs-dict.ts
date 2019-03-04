// tslint:disable:max-line-length
import { interfaces } from '../../barrels/interfaces';

export function makeUdfsDict(item: {
  udfs_user: interfaces.Udf[],
}) {

  let udfsDict: interfaces.UdfsDict = {};

  item.udfs_user.forEach(u => {
    udfsDict[u.name] = u.sql;
  });

  udfsDict['mprove_array_sum'] =
    `CREATE TEMPORARY FUNCTION mprove_array_sum(ar ARRAY<STRING>) AS
  ((SELECT SUM(CAST(REGEXP_EXTRACT(val, '\\\\|\\\\|(\\\\-?\\\\d+(?:.\\\\d+)?)\$') AS FLOAT64)) FROM UNNEST(ar) as val));`;

  udfsDict['mprove_approx_percentile_distinct_disc'] =

    `CREATE TEMPORARY FUNCTION mprove_approx_percentile_distinct_disc(a_num ARRAY<STRING>, fraction FLOAT64) RETURNS FLOAT64 AS
  ((
  SELECT
    MAX(num1)
  FROM (
    SELECT
      row_number() OVER (ORDER BY CAST(REGEXP_EXTRACT(num, '\\\\|\\\\|(\\\\-?\\\\d+(?:.\\\\d+)?)\$') AS FLOAT64)) - 1 as rn
      , CAST(REGEXP_EXTRACT(num, '\\\\|\\\\|(\\\\-?\\\\d+(?:.\\\\d+)?)\$') AS FLOAT64) as num1
    FROM UNNEST(a_num) num
    )
    WHERE
      rn = CEIL(ARRAY_LENGTH(a_num) * fraction) - 1
  ));`;

  return udfsDict;
}
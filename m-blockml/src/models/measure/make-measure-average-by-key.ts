/* eslint-disable @typescript-eslint/quotes */
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';

export function makeMeasureAverageByKey(item: {
  sqlKeyFinal: string;
  sqlFinal: string;
  connection: api.ProjectConnection;
}) {
  let { connection, sqlKeyFinal, sqlFinal } = item;

  let numerator;
  let denominator;
  let sqlSelect;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      numerator =
        `${constants.UDF_MPROVE_ARRAY_SUM}(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(` +
        sqlKeyFinal +
        " AS STRING), '||'), CAST(" +
        sqlFinal +
        ' AS STRING))))';

      denominator =
        'NULLIF(CAST(COUNT(DISTINCT CASE WHEN ' +
        sqlFinal +
        ' IS NOT NULL THEN ' +
        sqlKeyFinal +
        ' ELSE NULL END) AS FLOAT64), 0.0)';
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      let val =
        'CAST(FLOOR(COALESCE(' +
        sqlFinal +
        ', 0)*(1000000*1.0)) AS DECIMAL(38,0))';

      let left =
        "CAST(('x' || lpad(LEFT(MD5(CAST(" +
        sqlKeyFinal +
        " AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))* 1.0e8";

      let right =
        "CAST(('x' || lpad(RIGHT(MD5(CAST(" +
        sqlKeyFinal +
        " AS VARCHAR)),15), 16, '0'))::bit(64)::bigint AS DECIMAL(38,0))";

      numerator = `COALESCE(CAST((SUM(DISTINCT ${val} + ${left} + ${right}) - SUM(DISTINCT ${left} + ${right})) AS DOUBLE PRECISION) / CAST((1000000*1.0) AS DOUBLE PRECISION), 0)`;

      denominator =
        'NULLIF(COUNT(DISTINCT CASE WHEN ' +
        sqlFinal +
        ' IS NOT NULL THEN ' +
        sqlKeyFinal +
        ' ELSE NULL END), 0)';

      sqlSelect = `(${numerator} / ${denominator})`;
      break;
    }
  }

  return sqlSelect;
}

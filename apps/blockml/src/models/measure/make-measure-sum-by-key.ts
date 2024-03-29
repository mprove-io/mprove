import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

export function makeMeasureSumByKey(item: {
  sqlKeyFinal: string;
  sqlFinal: string;
  connection: common.ProjectConnection;
}) {
  let { connection, sqlKeyFinal, sqlFinal } = item;

  let sqlSelect;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sqlSelect =
        `COALESCE(${constants.UDF_MPROVE_ARRAY_SUM}(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(` +
        sqlKeyFinal +
        " AS STRING), '||'), CAST(" +
        sqlFinal +
        ' AS STRING)))), 0)';
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
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

      sqlSelect = `COALESCE(COALESCE(CAST((SUM(DISTINCT ${val} + ${left} + ${right}) - SUM(DISTINCT ${left} + ${right})) AS DOUBLE PRECISION) / CAST((1000000*1.0) AS DOUBLE PRECISION), 0), 0)`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      let val = `CAST(FLOOR(COALESCE(${sqlFinal}, 0)*(1000000*1.0)) AS DECIMAL(38,0))`;
      let k = `(TO_NUMBER(MD5(${sqlKeyFinal}), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') % 1.0e27)::NUMERIC(38, 0)`;

      sqlSelect = `COALESCE(CAST((SUM(DISTINCT(${val}) + ${k}) - SUM(DISTINCT${k})) AS DOUBLE PRECISION) / CAST((1000000*1.0) AS DOUBLE PRECISION), 0)`;
      break;
    }
  }

  return sqlSelect;
}

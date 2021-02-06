import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

export function makeMeasureMedianByKey(item: {
  sqlKeyFinal: string;
  sqlFinal: string;
  connection: common.ProjectConnection;
}) {
  let { connection, sqlKeyFinal, sqlFinal } = item;

  let sqlSelect =
    `${constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC}(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(` +
    sqlKeyFinal +
    " AS STRING), '||'), CAST(" +
    sqlFinal +
    ' AS STRING))), 0.5)';

  return sqlSelect;
}

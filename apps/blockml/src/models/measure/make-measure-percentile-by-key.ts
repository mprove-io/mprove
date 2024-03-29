import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

export function makeMeasurePercentileByKey(item: {
  sqlKeyFinal: string;
  sqlFinal: string;
  percentile: string;
  connection: common.ProjectConnection;
}) {
  let { connection, sqlKeyFinal, sqlFinal, percentile } = item;

  let sqlSelect =
    `${constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC}(ARRAY_AGG(DISTINCT CONCAT(CONCAT(CAST(` +
    sqlKeyFinal +
    " AS STRING), '||'), CAST(" +
    sqlFinal +
    ' AS STRING))), ' +
    Number(percentile) / 100 +
    ')';

  return sqlSelect;
}

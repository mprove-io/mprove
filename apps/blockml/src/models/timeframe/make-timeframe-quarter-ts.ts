import { barTimestamp } from '~blockml/barrels/bar-timestamp';
import { common } from '~blockml/barrels/common';

export function makeTimeframeQuarterTs(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql = barTimestamp.makeTimestampQuarter({
    connection: connection,
    currentTimestamp: sqlTimestamp
  });

  return sql;
}

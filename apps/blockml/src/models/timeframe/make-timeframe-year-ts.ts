import { barTimestamp } from '~blockml/barrels/bar-timestamp';
import { common } from '~blockml/barrels/common';

export function makeTimeframeYearTs(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql = barTimestamp.makeTimestampYear({
    connection: connection,
    currentTimestamp: sqlTimestamp
  });

  return sql;
}

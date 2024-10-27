import { barTimestamp } from '~blockml/barrels/bar-timestamp';
import { common } from '~blockml/barrels/common';

export function makeTimeframeHourTs(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql = barTimestamp.makeTimestampHour({
    connection: connection,
    currentTimestamp: sqlTimestamp
  });

  return sql;
}

import { barTimestamp } from '~blockml/barrels/bar-timestamp';
import { common } from '~blockml/barrels/common';

export function makeTimeframeWeekTs(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
  weekStart: common.ProjectWeekStartEnum;
}) {
  let { sqlTimestamp, connection, weekStart } = item;

  let sql = barTimestamp.makeTimestampWeek({
    connection: connection,
    currentTimestamp: sqlTimestamp,
    weekStart: weekStart
  });

  return sql;
}

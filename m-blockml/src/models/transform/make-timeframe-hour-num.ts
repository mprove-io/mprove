import { api } from '../../barrels/api';

export function makeTimeframeHourNum(item: {
  num: string;
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection, num } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql =
        `FORMAT_TIMESTAMP('%F %H', TIMESTAMP_TRUNC(TIMESTAMP_ADD(${sqlTimestamp}, INTERVAL ` +
        `MOD(-1 * EXTRACT(HOUR FROM ${sqlTimestamp}), ${num}) HOUR), HOUR))`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('hour', DATE_TRUNC('hour', ${sqlTimestamp} - (DATE_PART('hour', ${sqlTimestamp})::INT % ${num} || 'HOURS')::INTERVAL)), 'YYYY-MM-DD HH24')`;
      break;
    }
  }

  return sql;
}

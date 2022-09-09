import { common } from '~blockml/barrels/common';

export function makeTimeframeHourNum(item: {
  num: string;
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection, num } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql =
        `FORMAT_TIMESTAMP('%F %H', TIMESTAMP_TRUNC(TIMESTAMP_ADD(${sqlTimestamp}, INTERVAL ` +
        `MOD(-1 * EXTRACT(HOUR FROM ${sqlTimestamp}), ${num}) HOUR), HOUR))`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('hour', DATE_TRUNC('hour', ${sqlTimestamp} - (DATE_PART('hour', ${sqlTimestamp})::INT % ${num} || 'HOURS')::INTERVAL)), 'YYYY-MM-DD HH24')`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `formatDateTime(toStartOfHour(toDateTime(subtractHours(toDateTime(${sqlTimestamp}), toHour(toDateTime(${sqlTimestamp})) % ${num}))), '%Y-%m-%d %H')`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `TO_CHAR(DATE_TRUNC('hour', DATE_TRUNC('hour', DATEADD('HOURS', -1 * (DATE_PART('HOUR', ${sqlTimestamp}) % ${num}), ${sqlTimestamp}))), 'YYYY-MM-DD HH24')`;
      break;
    }
  }

  return sql;
}

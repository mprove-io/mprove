import { common } from '~blockml/barrels/common';

export function makeTimeframeMinuteNum(item: {
  num: string;
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection, num } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%F %H:%M', TIMESTAMP_TRUNC(TIMESTAMP_SECONDS((UNIX_SECONDS(${sqlTimestamp}) - MOD(UNIX_SECONDS(${sqlTimestamp}), (60*${num})))), MINUTE))`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('minute', DATE_TRUNC('minute', (timestamp 'epoch' + (DATE_PART('epoch', ${sqlTimestamp})::bigint - (DATE_PART('epoch', ${sqlTimestamp})::bigint % (60*${num}))) * interval '1 second'))), 'YYYY-MM-DD HH24:MI')`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `formatDateTime(toStartOfMinute(toDateTime(toDateTime(toUnixTimestamp(${sqlTimestamp} + interval 0 second) - (toUnixTimestamp(${sqlTimestamp} + interval 0 second) % (60*${num}))))), '%Y-%m-%d %H:%M')`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `TO_CHAR(DATE_TRUNC('minute', DATE_TRUNC('minute', TIMESTAMPADD(MINUTE, -(MOD(EXTRACT(MINUTE FROM ${sqlTimestamp}), ${num})), ${sqlTimestamp}))), 'YYYY-MM-DD HH24:MI')`;
      break;
    }
  }

  return sql;
}

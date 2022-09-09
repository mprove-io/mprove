import { common } from '~blockml/barrels/common';

export function makeTimeframeTimeOfDay(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%H:%M', ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(${sqlTimestamp}, 'HH24:MI')`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `formatDateTime(${sqlTimestamp}, '%H:%M')`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `TO_CHAR(${sqlTimestamp}, 'HH24:MI')`;
      break;
    }
  }

  return sql;
}

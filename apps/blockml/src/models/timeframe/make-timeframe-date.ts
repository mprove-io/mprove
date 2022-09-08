import { common } from '~blockml/barrels/common';

export function makeTimeframeDate(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `CAST(CAST(${sqlTimestamp} AS DATE) AS STRING)`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `SUBSTRING((${sqlTimestamp})::TEXT FROM 1 FOR 10)`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `toDate(${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `TO_CHAR(TO_DATE(${sqlTimestamp}), 'YYYY-MM-DD')`;
      break;
    }
  }

  return sql;
}

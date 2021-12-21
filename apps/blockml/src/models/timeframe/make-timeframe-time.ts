import { common } from '~blockml/barrels/common';

export function makeTimeframeTime(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%F %T', ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(${sqlTimestamp}, 'YYYY-MM-DD HH24:MI:SS')`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `CAST(${sqlTimestamp} AS String)`;
      break;
    }
  }

  return sql;
}

import { common } from '~blockml/barrels/common';

export function makeTimeframeMonth(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%Y-%m', ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('month', ${sqlTimestamp}), 'YYYY-MM')`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `formatDateTime(${sqlTimestamp}, '%Y-%m')`;
      break;
    }
  }

  return sql;
}

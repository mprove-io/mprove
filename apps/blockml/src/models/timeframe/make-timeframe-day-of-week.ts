import { common } from '~blockml/barrels/common';

export function makeTimeframeDayOfWeek(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `FORMAT_TIMESTAMP('%A', ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(${sqlTimestamp}, 'Day')`;
      break;
    }
  }

  return sql;
}

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

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `arrayElement(array('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), toDayOfWeek(${sqlTimestamp}))`;
      break;
    }
  }

  return sql;
}

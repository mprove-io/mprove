import { api } from '~blockml/barrels/api';

export function makeTimeframeDayOfWeekIndex(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
  weekStart: api.ProjectWeekStartEnum;
}) {
  let { sqlTimestamp, connection, weekStart } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql =
        weekStart === api.ProjectWeekStartEnum.Sunday
          ? `EXTRACT(DAYOFWEEK FROM ${sqlTimestamp})`
          : `CASE
      WHEN EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) = 1 THEN 7
      ELSE EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) - 1
      END`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql =
        weekStart === api.ProjectWeekStartEnum.Sunday
          ? `EXTRACT(DOW FROM ${sqlTimestamp}) + 1`
          : `CASE
      WHEN EXTRACT(DOW FROM ${sqlTimestamp}) + 1 = 1 THEN 7
      ELSE EXTRACT(DOW FROM ${sqlTimestamp}) + 1 - 1
      END`;
      break;
    }
  }

  return sql;
}

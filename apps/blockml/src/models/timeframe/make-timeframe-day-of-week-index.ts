import { common } from '~blockml/barrels/common';

export function makeTimeframeDayOfWeekIndex(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
  weekStart: common.ProjectWeekStartEnum;
}) {
  let { sqlTimestamp, connection, weekStart } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql =
        weekStart === common.ProjectWeekStartEnum.Sunday
          ? `EXTRACT(DAYOFWEEK FROM ${sqlTimestamp})`
          : `CASE
      WHEN EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) = 1 THEN 7
      ELSE EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) - 1
      END`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql =
        weekStart === common.ProjectWeekStartEnum.Sunday
          ? `EXTRACT(DOW FROM ${sqlTimestamp}) + 1`
          : `CASE
      WHEN EXTRACT(DOW FROM ${sqlTimestamp}) + 1 = 1 THEN 7
      ELSE EXTRACT(DOW FROM ${sqlTimestamp}) + 1 - 1
      END`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql =
        weekStart === common.ProjectWeekStartEnum.Sunday
          ? `toDayOfWeek(${sqlTimestamp}) + 1`
          : `CASE
      WHEN toDayOfWeek(${sqlTimestamp}) + 1 = 1 THEN 7
      ELSE toDayOfWeek(${sqlTimestamp}) + 1 - 1
      END`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql =
        weekStart === common.ProjectWeekStartEnum.Sunday
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

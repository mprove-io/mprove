import { common } from '~blockml/barrels/common';

export function makeTimeframeWeekOfYear(item: {
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
          ? `CAST(FORMAT_TIMESTAMP('%V', ${sqlTimestamp}) AS INT64)`
          : `CASE
WHEN EXTRACT(DAYOFWEEK FROM TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), YEAR)) = 1 THEN ` +
            `(CASE WHEN EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) = 1 THEN ` +
            `CAST(FORMAT_TIMESTAMP('%V', ${sqlTimestamp}) AS INT64) ELSE ` +
            `CAST(FORMAT_TIMESTAMP('%V', ${sqlTimestamp}) AS INT64) + 1 END)
ELSE (CASE WHEN EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) = 1 THEN ` +
            `CAST(FORMAT_TIMESTAMP('%V', ${sqlTimestamp}) AS INT64) - 1 ELSE ` +
            `CAST(FORMAT_TIMESTAMP('%V', ${sqlTimestamp}) AS INT64) END)
END`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `EXTRACT(WEEK from ${sqlTimestamp})`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql =
        weekStart === common.ProjectWeekStartEnum.Sunday
          ? `toWeek(${sqlTimestamp}, 6)`
          : `toWeek(${sqlTimestamp}, 3)`;
      break;
    }
  }

  return sql;
}

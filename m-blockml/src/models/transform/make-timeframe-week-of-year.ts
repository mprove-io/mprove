import { api } from '../../barrels/api';

export function makeTimeframeWeekOfYear(item: {
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

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `EXTRACT(WEEK from ${sqlTimestamp})`;
      break;
    }
  }

  return sql;
}

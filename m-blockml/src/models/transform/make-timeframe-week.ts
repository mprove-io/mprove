import { api } from '../../barrels/api';

export function makeTimeframeWeek(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
  weekStart: api.ProjectWeekStartEnum;
}) {
  let { sqlTimestamp, connection, weekStart } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      let dayOfYear = `EXTRACT(DAYOFYEAR FROM ${sqlTimestamp})`;

      let dayOfWeekIndex =
        weekStart === api.ProjectWeekStartEnum.Sunday
          ? `EXTRACT(DAYOFWEEK FROM ${sqlTimestamp})`
          : `(CASE WHEN EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) = 1 THEN 7 ELSE ` +
            `EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) - 1 END)`;

      let fullWeekStartDate =
        weekStart === api.ProjectWeekStartEnum.Sunday
          ? `CAST(CAST(TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), WEEK) AS DATE) AS STRING)`
          : `CAST(DATE_ADD(CAST(TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), WEEK) AS DATE), INTERVAL 1 DAY) AS STRING)`;

      sql = `CASE
WHEN ${dayOfYear} >= ${dayOfWeekIndex} THEN ${fullWeekStartDate}
ELSE CAST(DATE_ADD(CAST(${sqlTimestamp} AS DATE), INTERVAL -${dayOfYear} + 1 DAY) AS STRING)
END`;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('week', ${sqlTimestamp}), 'YYYY-MM-DD')`;

      break;
    }
  }

  return sql;
}

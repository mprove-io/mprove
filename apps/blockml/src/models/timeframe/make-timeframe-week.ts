import { common } from '~blockml/barrels/common';

export function makeTimeframeWeek(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
  weekStart: common.ProjectWeekStartEnum;
}) {
  let { sqlTimestamp, connection, weekStart } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      let dayOfYear = `EXTRACT(DAYOFYEAR FROM ${sqlTimestamp})`;

      let dayOfWeekIndex =
        weekStart === common.ProjectWeekStartEnum.Sunday
          ? `EXTRACT(DAYOFWEEK FROM ${sqlTimestamp})`
          : `(CASE WHEN EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) = 1 THEN 7 ELSE ` +
            `EXTRACT(DAYOFWEEK FROM ${sqlTimestamp}) - 1 END)`;

      let fullWeekStartDate =
        weekStart === common.ProjectWeekStartEnum.Sunday
          ? `CAST(CAST(TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), WEEK) AS DATE) AS STRING)`
          : `CAST(DATE_ADD(CAST(TIMESTAMP_TRUNC(CAST(${sqlTimestamp} AS TIMESTAMP), WEEK) AS DATE), INTERVAL 1 DAY) AS STRING)`;

      sql = `CASE
WHEN ${dayOfYear} >= ${dayOfWeekIndex} THEN ${fullWeekStartDate}
ELSE CAST(DATE_ADD(CAST(${sqlTimestamp} AS DATE), INTERVAL -${dayOfYear} + 1 DAY) AS STRING)
END`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(DATE_TRUNC('week', ${sqlTimestamp}), 'YYYY-MM-DD')`;

      break;
    }
  }

  return sql;
}

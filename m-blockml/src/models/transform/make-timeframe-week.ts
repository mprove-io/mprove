import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeWeek(item: {
  sql_timestamp: string;
  week_start: api.ProjectWeekStartEnum;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    let dayOfYear = `EXTRACT(DAYOFYEAR FROM ${item.sql_timestamp})`;

    let dayOfWeekIndex =
      item.week_start === api.ProjectWeekStartEnum.Sunday
        ? `EXTRACT(DAYOFWEEK FROM ${item.sql_timestamp})`
        : `(CASE WHEN EXTRACT(DAYOFWEEK FROM ${item.sql_timestamp}) = 1 THEN 7 ELSE ` +
          `EXTRACT(DAYOFWEEK FROM ${item.sql_timestamp}) - 1 END)`;

    let fullWeekStartDate =
      item.week_start === api.ProjectWeekStartEnum.Sunday
        ? `CAST(CAST(TIMESTAMP_TRUNC(CAST(${item.sql_timestamp} AS TIMESTAMP), WEEK) AS DATE) AS STRING)`
        : `CAST(DATE_ADD(CAST(TIMESTAMP_TRUNC(CAST(${item.sql_timestamp} AS TIMESTAMP), WEEK) AS DATE), INTERVAL 1 DAY) AS STRING)`;

    sql = `CASE
WHEN ${dayOfYear} >= ${dayOfWeekIndex} THEN ${fullWeekStartDate}
ELSE CAST(DATE_ADD(CAST(${item.sql_timestamp} AS DATE), INTERVAL -${dayOfYear} + 1 DAY) AS STRING)
END`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `TO_CHAR(DATE_TRUNC('week', ${item.sql_timestamp}), 'YYYY-MM-DD')`;
  }

  return sql;
}

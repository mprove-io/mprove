import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeDayOfWeekIndex(item: {
  sql_timestamp: string;
  week_start: api.ProjectWeekStartEnum;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql =
      item.week_start === api.ProjectWeekStartEnum.Sunday
        ? `EXTRACT(DAYOFWEEK FROM ${item.sql_timestamp})`
        : `CASE
      WHEN EXTRACT(DAYOFWEEK FROM ${item.sql_timestamp}) = 1 THEN 7
      ELSE EXTRACT(DAYOFWEEK FROM ${item.sql_timestamp}) - 1
    END`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql =
      item.week_start === api.ProjectWeekStartEnum.Sunday
        ? `EXTRACT(DOW FROM ${item.sql_timestamp}) + 1`
        : `CASE
      WHEN EXTRACT(DOW FROM ${item.sql_timestamp}) + 1 = 1 THEN 7
      ELSE EXTRACT(DOW FROM ${item.sql_timestamp}) + 1 - 1
    END`;
  }

  return sql;
}

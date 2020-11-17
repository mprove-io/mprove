import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimeframeMonthName(item: {
  sql_timestamp: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = `CASE
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 1 THEN 'January'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 2 THEN 'February'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 3 THEN 'March'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 4 THEN 'April'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 5 THEN 'May'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 6 THEN 'June'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 7 THEN 'July'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 8 THEN 'August'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 9 THEN 'September'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 10 THEN 'October'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 11 THEN 'November'
      WHEN EXTRACT(MONTH FROM ${item.sql_timestamp}) = 12 THEN 'December'
    END`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = `TO_CHAR(${item.sql_timestamp}, 'FMMonth')`;
  }

  return sql;
}

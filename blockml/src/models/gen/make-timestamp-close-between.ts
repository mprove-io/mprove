import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';

export function makeTimestampCloseBetween(item: {
  connection: api.ProjectConnectionEnum;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  open: string;
}) {
  let open = item.open;

  // 2016
  let year = item.year;
  // 2016/10
  let month = item.month;
  // 2016/10/05
  let day = item.day;
  // 2016/10/05 21
  let hour = item.hour;
  // 2016/10/05 21:07
  let minute = item.minute;

  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = minute
      ? `TIMESTAMP_ADD(${open}, INTERVAL 1 MINUTE)`
      : hour
      ? `TIMESTAMP_ADD(${open}, INTERVAL 1 HOUR)`
      : day
      ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL 1 DAY) AS TIMESTAMP)`
      : month
      ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL 1 MONTH) AS TIMESTAMP)`
      : year
      ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL 1 YEAR) AS TIMESTAMP)`
      : undefined;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = minute
      ? `${open} + INTERVAL '1 minute'`
      : hour
      ? `${open} + INTERVAL '1 hour'`
      : day
      ? `${open} + INTERVAL '1 day'`
      : month
      ? `${open} + INTERVAL '1 month'`
      : year
      ? `${open} + INTERVAL '1 year'`
      : undefined;
  }

  return sql;
}

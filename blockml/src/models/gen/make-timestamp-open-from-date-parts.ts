import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeTimestampOpenFromDateParts(item: {
  connection: api.ProjectConnectionEnum;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}) {
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
      ? `TIMESTAMP('${year}-${month}-${day} ${hour}:${minute}:00')`
      : hour
      ? `TIMESTAMP('${year}-${month}-${day} ${hour}:00:00')`
      : day
      ? `TIMESTAMP('${year}-${month}-${day}')`
      : month
      ? `TIMESTAMP('${year}-${month}-01')`
      : year
      ? `TIMESTAMP('${year}-01-01')`
      : undefined;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = minute
      ? `'${year}-${month}-${day} ${hour}:${minute}:00'::TIMESTAMP`
      : hour
      ? `'${year}-${month}-${day} ${hour}:00:00'::TIMESTAMP`
      : day
      ? `'${year}-${month}-${day}'::TIMESTAMP`
      : month
      ? `'${year}-${month}-01'::TIMESTAMP`
      : year
      ? `'${year}-01-01'::TIMESTAMP`
      : undefined;
  }

  return sql;
}

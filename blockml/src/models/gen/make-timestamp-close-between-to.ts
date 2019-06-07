import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';

export function makeTimestampCloseBetweenTo(item: {
  connection: api.ProjectConnectionEnum;
  to_year: string;
  to_month: string;
  to_day: string;
  to_hour: string;
  to_minute: string;
}) {
  // 2016/10/05 21:07:15 to 2017
  let toYear = item.to_year;
  // 2016/10/05 21:07:15 to 2017/11
  let toMonth = item.to_month;
  // 2016/10/05 21:07:15 to 2017/11/20
  let toDay = item.to_day;
  // 2016/10/05 21:07:15 to 2017/11/20 15
  let toHour = item.to_hour;
  // 2016/10/05 21:07:15 to 2017/11/20 15:31
  let toMinute = item.to_minute;

  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql = toMinute
      ? `TIMESTAMP('${toYear}-${toMonth}-${toDay} ${toHour}:${toMinute}:00')`
      : toHour
      ? `TIMESTAMP('${toYear}-${toMonth}-${toDay} ${toHour}:00:00')`
      : toDay
      ? `TIMESTAMP('${toYear}-${toMonth}-${toDay}')`
      : toMonth
      ? `TIMESTAMP('${toYear}-${toMonth}-01')`
      : toYear
      ? `TIMESTAMP('${toYear}-01-01')`
      : undefined;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql = toMinute
      ? `'${toYear}-${toMonth}-${toDay} ${toHour}:${toMinute}:00'::TIMESTAMP`
      : toHour
      ? `'${toYear}-${toMonth}-${toDay} ${toHour}:00:00'::TIMESTAMP`
      : toDay
      ? `'${toYear}-${toMonth}-${toDay}'::TIMESTAMP`
      : toMonth
      ? `'${toYear}-${toMonth}-01'::TIMESTAMP`
      : toYear
      ? `'${toYear}-01-01'::TIMESTAMP`
      : undefined;
  }

  return sql;
}

import { api } from '../../barrels/api';

export function makeTimestampCloseBetweenTo(item: {
  connection: api.ProjectConnection;
  toYear: string;
  toMonth: string;
  toDay: string;
  toHour: string;
  toMinute: string;
}) {
  let { connection, toYear, toMonth, toDay, toHour, toMinute } = item;

  // 2016/10/05 21:07:15 to 2017
  // 2016/10/05 21:07:15 to 2017/11
  // 2016/10/05 21:07:15 to 2017/11/20
  // 2016/10/05 21:07:15 to 2017/11/20 15
  // 2016/10/05 21:07:15 to 2017/11/20 15:31

  let sql;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
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
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
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
      break;
    }
  }

  return sql;
}

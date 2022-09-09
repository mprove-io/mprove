import { common } from '~blockml/barrels/common';

export function makeTimestampCloseBetweenTo(item: {
  connection: common.ProjectConnection;
  toYear: string;
  toMonth: string;
  toDay: string;
  toHour: string;
  toMinute: string;
  timezone: any;
}) {
  let { connection, toYear, toMonth, toDay, toHour, toMinute, timezone } = item;

  // 2016/10/05 21:07:15 to 2017
  // 2016/10/05 21:07:15 to 2017/11
  // 2016/10/05 21:07:15 to 2017/11/20
  // 2016/10/05 21:07:15 to 2017/11/20 15
  // 2016/10/05 21:07:15 to 2017/11/20 15:31

  let sql;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
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

    case common.ConnectionTypeEnum.PostgreSQL: {
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

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = toMinute
        ? `parseDateTimeBestEffort('${toYear}-${toMonth}-${toDay} ${toHour}:${toMinute}:00', '${timezone}')`
        : toHour
        ? `parseDateTimeBestEffort('${toYear}-${toMonth}-${toDay} ${toHour}:00:00', '${timezone}')`
        : toDay
        ? `parseDateTimeBestEffort('${toYear}-${toMonth}-${toDay}', '${timezone}')`
        : toMonth
        ? `parseDateTimeBestEffort('${toYear}-${toMonth}-01', '${timezone}')`
        : toYear
        ? `parseDateTimeBestEffort('${toYear}-01-01', '${timezone}')`
        : undefined;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = toMinute
        ? `TO_TIMESTAMP('${toYear}-${toMonth}-${toDay} ${toHour}:${toMinute}:00')`
        : toHour
        ? `TO_TIMESTAMP('${toYear}-${toMonth}-${toDay} ${toHour}:00:00')`
        : toDay
        ? `TO_TIMESTAMP('${toYear}-${toMonth}-${toDay}')`
        : toMonth
        ? `TO_TIMESTAMP('${toYear}-${toMonth}-01')`
        : toYear
        ? `TO_TIMESTAMP('${toYear}-01-01')`
        : undefined;
      break;
    }
  }

  return sql;
}

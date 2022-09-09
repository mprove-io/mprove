import { common } from '~blockml/barrels/common';

export function makeTimestampOpenFromDateParts(item: {
  connection: common.ProjectConnection;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  timezone: any;
}) {
  let { connection, year, month, day, hour, minute, timezone } = item;

  // 2016
  // 2016/10
  // 2016/10/05
  // 2016/10/05 21
  // 2016/10/05 21:07

  let sql;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
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
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
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
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = minute
        ? `parseDateTimeBestEffort('${year}-${month}-${day} ${hour}:${minute}:00', '${timezone}')`
        : hour
        ? `parseDateTimeBestEffort('${year}-${month}-${day} ${hour}:00:00', '${timezone}')`
        : day
        ? `parseDateTimeBestEffort('${year}-${month}-${day}', '${timezone}')`
        : month
        ? `parseDateTimeBestEffort('${year}-${month}-01', '${timezone}')`
        : year
        ? `parseDateTimeBestEffort('${year}-01-01', '${timezone}')`
        : undefined;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = minute
        ? `TO_TIMESTAMP('${year}-${month}-${day} ${hour}:${minute}:00')`
        : hour
        ? `TO_TIMESTAMP('${year}-${month}-${day} ${hour}:00:00')`
        : day
        ? `TO_TIMESTAMP('${year}-${month}-${day}')`
        : month
        ? `TO_TIMESTAMP('${year}-${month}-01')`
        : year
        ? `TO_TIMESTAMP('${year}-01-01')`
        : undefined;
      break;
    }
  }

  return sql;
}

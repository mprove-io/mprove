import { api } from '~/barrels/api';

export function makeTimestampCloseBetween(item: {
  connection: api.ProjectConnection;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  open: string;
}) {
  let { connection, year, month, day, hour, minute, open } = item;

  // 2016
  // 2016/10
  // 2016/10/05
  // 2016/10/05 21
  // 2016/10/05 21:07

  let sql;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
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
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
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
      break;
    }
  }

  return sql;
}

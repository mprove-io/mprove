import { add } from 'date-fns';
import { common } from '~blockml/barrels/common';

export function makeTimestampCloseBetween(item: {
  connection: common.ProjectConnection;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  open: string;
  getTimeRange: boolean;
  rangeOpen: Date;
}) {
  let {
    connection,
    year,
    month,
    day,
    hour,
    minute,
    open,
    getTimeRange,
    rangeOpen
  } = item;

  // 2016
  // 2016/10
  // 2016/10/05
  // 2016/10/05 21
  // 2016/10/05 21:07

  let sqlClose;
  let rgClose;

  if (getTimeRange === true) {
    rgClose = minute
      ? add(rangeOpen, { minutes: 1 })
      : hour
      ? add(rangeOpen, { hours: 1 })
      : day
      ? add(rangeOpen, { days: 1 })
      : month
      ? add(rangeOpen, { months: 1 })
      : year
      ? add(rangeOpen, { years: 1 })
      : undefined;
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        sqlClose = minute
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

      case common.ConnectionTypeEnum.PostgreSQL: {
        sqlClose = minute
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

      case common.ConnectionTypeEnum.ClickHouse: {
        sqlClose = minute
          ? `addMinutes(${open}, 1)`
          : hour
          ? `addHours(${open}, 1)`
          : day
          ? `addDays(${open}, 1)`
          : month
          ? `addMonths(${open}, 1)`
          : year
          ? `addYears(${open}, 1)`
          : undefined;
        break;
      }

      case common.ConnectionTypeEnum.SnowFlake: {
        sqlClose = minute
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
  }

  return { sqlClose, rgClose };
}

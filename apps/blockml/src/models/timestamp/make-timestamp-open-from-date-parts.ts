import { parseISO } from 'date-fns';
import { common } from '~blockml/barrels/common';

export function makeTimestampOpenFromDateParts(item: {
  connection: common.ProjectConnection;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  timezone: any;
  getTimeRange: boolean;
}) {
  let { connection, year, month, day, hour, minute, timezone, getTimeRange } =
    item;

  // 2016
  // 2016/10
  // 2016/10/05
  // 2016/10/05 21
  // 2016/10/05 21:07

  let sqlOpen;
  let rgOpen;

  if (getTimeRange === true) {
    rgOpen = minute
      ? parseISO(`${year}-${month}-${day}T${hour}:${minute}:00`)
      : hour
      ? parseISO(`${year}-${month}-${day}T${hour}:00:00`)
      : day
      ? parseISO(`${year}-${month}-${day}`)
      : month
      ? parseISO(`${year}-${month}-01`)
      : year
      ? parseISO(`${year}-01-01`)
      : undefined;
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        sqlOpen = minute
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
        sqlOpen = minute
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
        sqlOpen = minute
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
        sqlOpen = minute
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
  }

  return { sqlOpen, rgOpen };
}

import { add, fromUnixTime } from 'date-fns';
import { common } from '~blockml/barrels/common';

export function makeTimestampOpenBeforeAfterInFuture(item: {
  connection: common.ProjectConnection;
  unit: string;
  integer: number;
  currentTs: string;
  getTimeRange: boolean;
}) {
  let { connection, unit, integer, currentTs, getTimeRange } = item;

  let sqlOpen;
  let rgOpen;

  if (getTimeRange === true) {
    rgOpen =
      unit === common.FractionUnitEnum.Minutes
        ? add(fromUnixTime(Number(currentTs)), { minutes: integer })
        : unit === common.FractionUnitEnum.Hours
        ? add(fromUnixTime(Number(currentTs)), { hours: integer })
        : unit === common.FractionUnitEnum.Days
        ? add(fromUnixTime(Number(currentTs)), { days: integer })
        : unit === common.FractionUnitEnum.Weeks
        ? add(fromUnixTime(Number(currentTs)), { days: integer * 7 })
        : unit === common.FractionUnitEnum.Months
        ? add(fromUnixTime(Number(currentTs)), { months: integer })
        : unit === common.FractionUnitEnum.Quarters
        ? add(fromUnixTime(Number(currentTs)), { months: integer * 3 })
        : unit === common.FractionUnitEnum.Years
        ? add(fromUnixTime(Number(currentTs)), { years: integer })
        : undefined;
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `TIMESTAMP_ADD(${currentTs}, INTERVAL ${integer} MINUTE)`
            : unit === common.FractionUnitEnum.Hours
            ? `TIMESTAMP_ADD(${currentTs}, INTERVAL ${integer} HOUR)`
            : unit === common.FractionUnitEnum.Days
            ? `TIMESTAMP_ADD(${currentTs}, INTERVAL ${integer} DAY)`
            : unit === common.FractionUnitEnum.Weeks
            ? `TIMESTAMP_ADD(${currentTs}, INTERVAL ${integer}*7 DAY)`
            : unit === common.FractionUnitEnum.Months
            ? `CAST(DATE_ADD(CAST(${currentTs} AS DATE), ` +
              `INTERVAL ${integer} MONTH) AS TIMESTAMP)`
            : unit === common.FractionUnitEnum.Quarters
            ? `CAST(DATE_ADD(CAST(${currentTs} AS DATE), ` +
              `INTERVAL ${integer} QUARTER) AS TIMESTAMP)`
            : unit === common.FractionUnitEnum.Years
            ? `CAST(DATE_ADD(CAST(${currentTs} AS DATE), ` +
              `INTERVAL ${integer} YEAR) AS TIMESTAMP)`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.PostgreSQL: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `${currentTs} + INTERVAL '${integer} minute'`
            : unit === common.FractionUnitEnum.Hours
            ? `${currentTs} + INTERVAL '${integer} hour'`
            : unit === common.FractionUnitEnum.Days
            ? `${currentTs} + INTERVAL '${integer} day'`
            : unit === common.FractionUnitEnum.Weeks
            ? `${currentTs} + INTERVAL '${integer * 7} day'`
            : unit === common.FractionUnitEnum.Months
            ? `${currentTs} + INTERVAL '${integer} month'`
            : unit === common.FractionUnitEnum.Quarters
            ? `${currentTs} + INTERVAL '${integer * 3} month'`
            : unit === common.FractionUnitEnum.Years
            ? `${currentTs} + INTERVAL '${integer} year'`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.ClickHouse: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `addMinutes(${currentTs}, ${integer})`
            : unit === common.FractionUnitEnum.Hours
            ? `addHours(${currentTs}, ${integer})`
            : unit === common.FractionUnitEnum.Days
            ? `addDays(${currentTs}, ${integer})`
            : unit === common.FractionUnitEnum.Weeks
            ? `addDays(${currentTs}, ${integer * 7})`
            : unit === common.FractionUnitEnum.Months
            ? `addMonths(${currentTs}, ${integer})`
            : unit === common.FractionUnitEnum.Quarters
            ? `addMonths(${currentTs}, ${integer * 3})`
            : unit === common.FractionUnitEnum.Years
            ? `addYears(${currentTs}, ${integer})`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.SnowFlake: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `${currentTs} + INTERVAL '${integer} minute'`
            : unit === common.FractionUnitEnum.Hours
            ? `${currentTs} + INTERVAL '${integer} hour'`
            : unit === common.FractionUnitEnum.Days
            ? `${currentTs} + INTERVAL '${integer} day'`
            : unit === common.FractionUnitEnum.Weeks
            ? `${currentTs} + INTERVAL '${integer * 7} day'`
            : unit === common.FractionUnitEnum.Months
            ? `${currentTs} + INTERVAL '${integer} month'`
            : unit === common.FractionUnitEnum.Quarters
            ? `${currentTs} + INTERVAL '${integer * 3} month'`
            : unit === common.FractionUnitEnum.Years
            ? `${currentTs} + INTERVAL '${integer} year'`
            : undefined;
        break;
      }
    }
  }

  return { sqlOpen, rgOpen };
}

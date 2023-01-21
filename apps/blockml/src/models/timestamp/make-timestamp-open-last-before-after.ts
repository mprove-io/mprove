import { fromUnixTime, sub } from 'date-fns';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';

export function makeTimestampOpenLastBeforeAfter(item: {
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
      unit === enums.FractionUnitEnum.Minutes
        ? sub(fromUnixTime(Number(currentTs)), { minutes: integer })
        : unit === enums.FractionUnitEnum.Hours
        ? sub(fromUnixTime(Number(currentTs)), { hours: integer })
        : unit === enums.FractionUnitEnum.Days
        ? sub(fromUnixTime(Number(currentTs)), { days: integer })
        : unit === enums.FractionUnitEnum.Weeks
        ? sub(fromUnixTime(Number(currentTs)), { days: integer * 7 })
        : unit === enums.FractionUnitEnum.Months
        ? sub(fromUnixTime(Number(currentTs)), { months: integer })
        : unit === enums.FractionUnitEnum.Quarters
        ? sub(fromUnixTime(Number(currentTs)), { months: integer * 3 })
        : unit === enums.FractionUnitEnum.Years
        ? sub(fromUnixTime(Number(currentTs)), { years: integer })
        : undefined;
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        sqlOpen =
          unit === enums.FractionUnitEnum.Minutes
            ? `TIMESTAMP_ADD(${currentTs}, INTERVAL -${integer} MINUTE)`
            : unit === enums.FractionUnitEnum.Hours
            ? `TIMESTAMP_ADD(${currentTs}, INTERVAL -${integer} HOUR)`
            : unit === enums.FractionUnitEnum.Days
            ? `TIMESTAMP_ADD(${currentTs}, INTERVAL -${integer} DAY)`
            : unit === enums.FractionUnitEnum.Weeks
            ? `TIMESTAMP_ADD(${currentTs}, INTERVAL -${integer}*7 DAY)`
            : unit === enums.FractionUnitEnum.Months
            ? `CAST(DATE_ADD(CAST(${currentTs} AS DATE), ` +
              `INTERVAL -${integer} MONTH) AS TIMESTAMP)`
            : unit === enums.FractionUnitEnum.Quarters
            ? `CAST(DATE_ADD(CAST(${currentTs} AS DATE), ` +
              `INTERVAL -${integer} QUARTER) AS TIMESTAMP)`
            : unit === enums.FractionUnitEnum.Years
            ? `CAST(DATE_ADD(CAST(${currentTs} AS DATE), ` +
              `INTERVAL -${integer} YEAR) AS TIMESTAMP)`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.PostgreSQL: {
        sqlOpen =
          unit === enums.FractionUnitEnum.Minutes
            ? `${currentTs} + INTERVAL '-${integer} minute'`
            : unit === enums.FractionUnitEnum.Hours
            ? `${currentTs} + INTERVAL '-${integer} hour'`
            : unit === enums.FractionUnitEnum.Days
            ? `${currentTs} + INTERVAL '-${integer} day'`
            : unit === enums.FractionUnitEnum.Weeks
            ? `${currentTs} + INTERVAL '-${integer * 7} day'`
            : unit === enums.FractionUnitEnum.Months
            ? `${currentTs} + INTERVAL '-${integer} month'`
            : unit === enums.FractionUnitEnum.Quarters
            ? `${currentTs} + INTERVAL '-${integer * 3} month'`
            : unit === enums.FractionUnitEnum.Years
            ? `${currentTs} + INTERVAL '-${integer} year'`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.ClickHouse: {
        sqlOpen =
          unit === enums.FractionUnitEnum.Minutes
            ? `subtractMinutes(${currentTs}, ${integer})`
            : unit === enums.FractionUnitEnum.Hours
            ? `subtractHours(${currentTs}, ${integer})`
            : unit === enums.FractionUnitEnum.Days
            ? `subtractDays(${currentTs}, ${integer})`
            : unit === enums.FractionUnitEnum.Weeks
            ? `subtractDays(${currentTs}, ${integer * 7})`
            : unit === enums.FractionUnitEnum.Months
            ? `subtractMonths(${currentTs}, ${integer})`
            : unit === enums.FractionUnitEnum.Quarters
            ? `subtractMonths(${currentTs}, ${integer * 3})`
            : unit === enums.FractionUnitEnum.Years
            ? `subtractYears(${currentTs}, ${integer})`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.SnowFlake: {
        sqlOpen =
          unit === enums.FractionUnitEnum.Minutes
            ? `${currentTs} + INTERVAL '-${integer} minute'`
            : unit === enums.FractionUnitEnum.Hours
            ? `${currentTs} + INTERVAL '-${integer} hour'`
            : unit === enums.FractionUnitEnum.Days
            ? `${currentTs} + INTERVAL '-${integer} day'`
            : unit === enums.FractionUnitEnum.Weeks
            ? `${currentTs} + INTERVAL '-${integer * 7} day'`
            : unit === enums.FractionUnitEnum.Months
            ? `${currentTs} + INTERVAL '-${integer} month'`
            : unit === enums.FractionUnitEnum.Quarters
            ? `${currentTs} + INTERVAL '-${integer * 3} month'`
            : unit === enums.FractionUnitEnum.Years
            ? `${currentTs} + INTERVAL '-${integer} year'`
            : undefined;
        break;
      }
    }
  }

  return { sqlOpen, rgOpen };
}

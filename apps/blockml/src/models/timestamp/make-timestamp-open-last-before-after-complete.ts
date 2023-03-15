import { fromUnixTime, sub } from 'date-fns';
import { common } from '~blockml/barrels/common';

export function makeTimestampOpenLastBeforeAfterComplete(item: {
  connection: common.ProjectConnection;
  unit: string;
  integer: number;
  currentYearTs: string;
  currentQuarterTs: string;
  currentMonthTs: string;
  currentWeekStartTs: string;
  currentDateTs: string;
  currentHourTs: string;
  currentMinuteTs: string;
  getTimeRange: boolean;
}) {
  let {
    connection,
    unit,
    integer,
    currentYearTs,
    currentQuarterTs,
    currentMonthTs,
    currentWeekStartTs,
    currentDateTs,
    currentHourTs,
    currentMinuteTs,
    getTimeRange
  } = item;

  let sqlOpen;
  let rgOpen;

  if (getTimeRange === true) {
    rgOpen =
      unit === common.FractionUnitEnum.Minutes
        ? sub(fromUnixTime(Number(currentMinuteTs)), { minutes: integer })
        : unit === common.FractionUnitEnum.Hours
        ? sub(fromUnixTime(Number(currentHourTs)), { hours: integer })
        : unit === common.FractionUnitEnum.Days
        ? sub(fromUnixTime(Number(currentDateTs)), { days: integer })
        : unit === common.FractionUnitEnum.Weeks
        ? sub(fromUnixTime(Number(currentWeekStartTs)), { days: integer * 7 })
        : unit === common.FractionUnitEnum.Months
        ? sub(fromUnixTime(Number(currentMonthTs)), { months: integer })
        : unit === common.FractionUnitEnum.Quarters
        ? sub(fromUnixTime(Number(currentQuarterTs)), { months: integer * 3 })
        : unit === common.FractionUnitEnum.Years
        ? sub(fromUnixTime(Number(currentYearTs)), { years: integer })
        : undefined;
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `TIMESTAMP_ADD(${currentMinuteTs}, INTERVAL -${integer} MINUTE)`
            : unit === common.FractionUnitEnum.Hours
            ? `TIMESTAMP_ADD(${currentHourTs}, INTERVAL -${integer} HOUR)`
            : unit === common.FractionUnitEnum.Days
            ? `TIMESTAMP_ADD(${currentDateTs}, INTERVAL -${integer} DAY)`
            : unit === common.FractionUnitEnum.Weeks
            ? `TIMESTAMP_ADD(${currentWeekStartTs}, INTERVAL -${integer}*7 DAY)`
            : unit === common.FractionUnitEnum.Months
            ? `CAST(DATE_ADD(CAST(${currentMonthTs} AS DATE), ` +
              `INTERVAL -${integer} MONTH) AS TIMESTAMP)`
            : unit === common.FractionUnitEnum.Quarters
            ? `CAST(DATE_ADD(CAST(${currentQuarterTs} AS DATE), ` +
              `INTERVAL -${integer} QUARTER) AS TIMESTAMP)`
            : unit === common.FractionUnitEnum.Years
            ? `CAST(DATE_ADD(CAST(${currentYearTs} AS DATE), ` +
              `INTERVAL -${integer} YEAR) AS TIMESTAMP)`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.PostgreSQL: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `${currentMinuteTs} + INTERVAL '-${integer} minute'`
            : unit === common.FractionUnitEnum.Hours
            ? `${currentHourTs} + INTERVAL '-${integer} hour'`
            : unit === common.FractionUnitEnum.Days
            ? `${currentDateTs} + INTERVAL '-${integer} day'`
            : unit === common.FractionUnitEnum.Weeks
            ? `${currentWeekStartTs} + INTERVAL '-${integer * 7} day'`
            : unit === common.FractionUnitEnum.Months
            ? `${currentMonthTs} + INTERVAL '-${integer} month'`
            : unit === common.FractionUnitEnum.Quarters
            ? `${currentQuarterTs} + INTERVAL '-${integer * 3} month'`
            : unit === common.FractionUnitEnum.Years
            ? `${currentYearTs} + INTERVAL '-${integer} year'`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.ClickHouse: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `subtractMinutes(${currentMinuteTs}, ${integer})`
            : unit === common.FractionUnitEnum.Hours
            ? `subtractHours(${currentHourTs}, ${integer})`
            : unit === common.FractionUnitEnum.Days
            ? `subtractDays(${currentDateTs}, ${integer})`
            : unit === common.FractionUnitEnum.Weeks
            ? `subtractDays(${currentWeekStartTs}, ${integer * 7})`
            : unit === common.FractionUnitEnum.Months
            ? `subtractMonths(${currentMonthTs}, ${integer})`
            : unit === common.FractionUnitEnum.Quarters
            ? `subtractMonths(${currentQuarterTs}, ${integer * 3})`
            : unit === common.FractionUnitEnum.Years
            ? `subtractYears(${currentYearTs}, ${integer})`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.SnowFlake: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `${currentMinuteTs} + INTERVAL '-${integer} minute'`
            : unit === common.FractionUnitEnum.Hours
            ? `${currentHourTs} + INTERVAL '-${integer} hour'`
            : unit === common.FractionUnitEnum.Days
            ? `${currentDateTs} + INTERVAL '-${integer} day'`
            : unit === common.FractionUnitEnum.Weeks
            ? `${currentWeekStartTs} + INTERVAL '-${integer * 7} day'`
            : unit === common.FractionUnitEnum.Months
            ? `${currentMonthTs} + INTERVAL '-${integer} month'`
            : unit === common.FractionUnitEnum.Quarters
            ? `${currentQuarterTs} + INTERVAL '-${integer * 3} month'`
            : unit === common.FractionUnitEnum.Years
            ? `${currentYearTs} + INTERVAL '-${integer} year'`
            : undefined;
        break;
      }
    }
  }

  return { sqlOpen, rgOpen };
}

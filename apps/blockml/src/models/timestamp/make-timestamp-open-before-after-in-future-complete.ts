import { add, fromUnixTime } from 'date-fns';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';

export function makeTimestampOpenBeforeAfterInFutureComplete(item: {
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
      unit === enums.FractionUnitEnum.Minutes
        ? add(fromUnixTime(Number(currentMinuteTs)), { minutes: integer + 1 })
        : unit === enums.FractionUnitEnum.Hours
        ? add(fromUnixTime(Number(currentHourTs)), { hours: integer + 1 })
        : unit === enums.FractionUnitEnum.Days
        ? add(fromUnixTime(Number(currentDateTs)), { days: integer + 1 })
        : unit === enums.FractionUnitEnum.Weeks
        ? add(fromUnixTime(Number(currentWeekStartTs)), {
            days: integer * 7 + 1 * 7
          })
        : unit === enums.FractionUnitEnum.Months
        ? add(fromUnixTime(Number(currentMonthTs)), { months: integer + 1 })
        : unit === enums.FractionUnitEnum.Quarters
        ? add(fromUnixTime(Number(currentQuarterTs)), {
            months: integer * 3 + 1 * 3
          })
        : unit === enums.FractionUnitEnum.Years
        ? add(fromUnixTime(Number(currentYearTs)), { years: integer + 1 })
        : undefined;
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        sqlOpen =
          unit === enums.FractionUnitEnum.Minutes
            ? `TIMESTAMP_ADD(${currentMinuteTs}, INTERVAL ${integer} + 1 MINUTE)`
            : unit === enums.FractionUnitEnum.Hours
            ? `TIMESTAMP_ADD(${currentHourTs}, INTERVAL ${integer} + 1 HOUR)`
            : unit === enums.FractionUnitEnum.Days
            ? `TIMESTAMP_ADD(${currentDateTs}, INTERVAL ${integer} + 1 DAY)`
            : unit === enums.FractionUnitEnum.Weeks
            ? `TIMESTAMP_ADD(${currentWeekStartTs}, INTERVAL ${integer}*7 + 1*7 DAY)`
            : unit === enums.FractionUnitEnum.Months
            ? `CAST(DATE_ADD(CAST(${currentMonthTs} AS DATE), ` +
              `INTERVAL ${integer} + 1 MONTH) AS TIMESTAMP)`
            : unit === enums.FractionUnitEnum.Quarters
            ? `CAST(DATE_ADD(CAST(${currentQuarterTs} AS DATE), ` +
              `INTERVAL ${integer} + 1 QUARTER) AS TIMESTAMP)`
            : unit === enums.FractionUnitEnum.Years
            ? `CAST(DATE_ADD(CAST(${currentYearTs} AS DATE), ` +
              `INTERVAL ${integer} + 1 YEAR) AS TIMESTAMP)`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.PostgreSQL: {
        sqlOpen =
          unit === enums.FractionUnitEnum.Minutes
            ? `${currentMinuteTs} + INTERVAL '${integer + 1} minute'`
            : unit === enums.FractionUnitEnum.Hours
            ? `${currentHourTs} + INTERVAL '${integer + 1} hour'`
            : unit === enums.FractionUnitEnum.Days
            ? `${currentDateTs} + INTERVAL '${integer + 1} day'`
            : unit === enums.FractionUnitEnum.Weeks
            ? `${currentWeekStartTs} + INTERVAL '${integer * 7 + 1 * 7} day'`
            : unit === enums.FractionUnitEnum.Months
            ? `${currentMonthTs} + INTERVAL '${integer + 1} month'`
            : unit === enums.FractionUnitEnum.Quarters
            ? `${currentQuarterTs} + INTERVAL '${integer * 3 + 1 * 3} month'`
            : unit === enums.FractionUnitEnum.Years
            ? `${currentYearTs} + INTERVAL '${integer + 1} year'`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.ClickHouse: {
        sqlOpen =
          unit === enums.FractionUnitEnum.Minutes
            ? `addMinutes(${currentMinuteTs}, ${integer + 1})`
            : unit === enums.FractionUnitEnum.Hours
            ? `addHours(${currentHourTs}, ${integer + 1})`
            : unit === enums.FractionUnitEnum.Days
            ? `addDays(${currentDateTs}, ${integer + 1})`
            : unit === enums.FractionUnitEnum.Weeks
            ? `addDays(${currentWeekStartTs}, ${integer * 7 + 1 * 7})`
            : unit === enums.FractionUnitEnum.Months
            ? `addMonths(${currentMonthTs}, ${integer + 1})`
            : unit === enums.FractionUnitEnum.Quarters
            ? `addMonths(${currentQuarterTs}, ${integer * 3 + 1 * 3})`
            : unit === enums.FractionUnitEnum.Years
            ? `addYears(${currentYearTs}, ${integer + 1})`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.SnowFlake: {
        sqlOpen =
          unit === enums.FractionUnitEnum.Minutes
            ? `${currentMinuteTs} + INTERVAL '${integer + 1} minute'`
            : unit === enums.FractionUnitEnum.Hours
            ? `${currentHourTs} + INTERVAL '${integer + 1} hour'`
            : unit === enums.FractionUnitEnum.Days
            ? `${currentDateTs} + INTERVAL '${integer + 1} day'`
            : unit === enums.FractionUnitEnum.Weeks
            ? `${currentWeekStartTs} + INTERVAL '${integer * 7 + 1 * 7} day'`
            : unit === enums.FractionUnitEnum.Months
            ? `${currentMonthTs} + INTERVAL '${integer + 1} month'`
            : unit === enums.FractionUnitEnum.Quarters
            ? `${currentQuarterTs} + INTERVAL '${integer * 3 + 1 * 3} month'`
            : unit === enums.FractionUnitEnum.Years
            ? `${currentYearTs} + INTERVAL '${integer + 1} year'`
            : undefined;
        break;
      }
    }
  }

  return { sqlOpen, rgOpen };
}

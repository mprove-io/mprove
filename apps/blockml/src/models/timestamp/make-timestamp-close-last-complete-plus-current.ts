import { add, fromUnixTime } from 'date-fns';
import { common } from '~blockml/barrels/common';

export function makeTimestampCloseLastCompletePlusCurrent(item: {
  connection: common.ProjectConnection;
  unit: string;
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
    currentYearTs,
    currentQuarterTs,
    currentMonthTs,
    currentWeekStartTs,
    currentDateTs,
    currentHourTs,
    currentMinuteTs,
    getTimeRange
  } = item;

  let sqlClose;
  let rgClose;

  if (getTimeRange === true) {
    rgClose =
      unit === common.FractionUnitEnum.Minutes
        ? add(fromUnixTime(Number(currentMinuteTs)), { minutes: 1 })
        : unit === common.FractionUnitEnum.Hours
        ? add(fromUnixTime(Number(currentHourTs)), { hours: 1 })
        : unit === common.FractionUnitEnum.Days
        ? add(fromUnixTime(Number(currentDateTs)), { days: 1 })
        : unit === common.FractionUnitEnum.Weeks
        ? add(fromUnixTime(Number(currentWeekStartTs)), { days: 1 * 7 })
        : unit === common.FractionUnitEnum.Months
        ? add(fromUnixTime(Number(currentMonthTs)), { months: 1 })
        : unit === common.FractionUnitEnum.Quarters
        ? add(fromUnixTime(Number(currentQuarterTs)), { months: 1 * 3 })
        : unit === common.FractionUnitEnum.Years
        ? add(fromUnixTime(Number(currentYearTs)), { years: 1 })
        : undefined;
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        sqlClose =
          unit === common.FractionUnitEnum.Minutes
            ? `TIMESTAMP_ADD(${currentMinuteTs}, INTERVAL 1 MINUTE)`
            : unit === common.FractionUnitEnum.Hours
            ? `TIMESTAMP_ADD(${currentHourTs}, INTERVAL 1 HOUR)`
            : unit === common.FractionUnitEnum.Days
            ? `TIMESTAMP_ADD(${currentDateTs}, INTERVAL 1 DAY)`
            : unit === common.FractionUnitEnum.Weeks
            ? `TIMESTAMP_ADD(${currentWeekStartTs}, INTERVAL 1*7 DAY)`
            : unit === common.FractionUnitEnum.Months
            ? `CAST(DATE_ADD(CAST(${currentMonthTs} AS DATE), INTERVAL 1 MONTH) AS TIMESTAMP)`
            : unit === common.FractionUnitEnum.Quarters
            ? `CAST(DATE_ADD(CAST(${currentQuarterTs} AS DATE), INTERVAL 1 QUARTER) AS TIMESTAMP)`
            : unit === common.FractionUnitEnum.Years
            ? `CAST(DATE_ADD(CAST(${currentYearTs} AS DATE), INTERVAL 1 YEAR) AS TIMESTAMP)`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.PostgreSQL: {
        sqlClose =
          unit === common.FractionUnitEnum.Minutes
            ? `${currentMinuteTs} + INTERVAL '1 minute'`
            : unit === common.FractionUnitEnum.Hours
            ? `${currentHourTs} + INTERVAL '1 hour'`
            : unit === common.FractionUnitEnum.Days
            ? `${currentDateTs} + INTERVAL '1 day'`
            : unit === common.FractionUnitEnum.Weeks
            ? `${currentWeekStartTs} + INTERVAL '${1 * 7} day'`
            : unit === common.FractionUnitEnum.Months
            ? `${currentMonthTs} + INTERVAL '1 month'`
            : unit === common.FractionUnitEnum.Quarters
            ? `${currentQuarterTs} + INTERVAL '${1 * 3} month'`
            : unit === common.FractionUnitEnum.Years
            ? `${currentYearTs} + INTERVAL '1 year'`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.ClickHouse: {
        sqlClose =
          unit === common.FractionUnitEnum.Minutes
            ? `addMinutes(${currentMinuteTs}, 1)`
            : unit === common.FractionUnitEnum.Hours
            ? `addHours(${currentHourTs}, 1)`
            : unit === common.FractionUnitEnum.Days
            ? `addDays(${currentDateTs}, 1)`
            : unit === common.FractionUnitEnum.Weeks
            ? `addDays(${currentWeekStartTs}, ${1 * 7})`
            : unit === common.FractionUnitEnum.Months
            ? `addMonths(${currentMonthTs}, 1)`
            : unit === common.FractionUnitEnum.Quarters
            ? `addMonths(${currentQuarterTs}, ${1 * 3})`
            : unit === common.FractionUnitEnum.Years
            ? `addYears(${currentYearTs}, 1)`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.SnowFlake: {
        sqlClose =
          unit === common.FractionUnitEnum.Minutes
            ? `${currentMinuteTs} + INTERVAL '1 minute'`
            : unit === common.FractionUnitEnum.Hours
            ? `${currentHourTs} + INTERVAL '1 hour'`
            : unit === common.FractionUnitEnum.Days
            ? `${currentDateTs} + INTERVAL '1 day'`
            : unit === common.FractionUnitEnum.Weeks
            ? `${currentWeekStartTs} + INTERVAL '${1 * 7} day'`
            : unit === common.FractionUnitEnum.Months
            ? `${currentMonthTs} + INTERVAL '1 month'`
            : unit === common.FractionUnitEnum.Quarters
            ? `${currentQuarterTs} + INTERVAL '${1 * 3} month'`
            : unit === common.FractionUnitEnum.Years
            ? `${currentYearTs} + INTERVAL '1 year'`
            : undefined;
        break;
      }
    }
  }

  return { sqlClose, rgClose };
}

import { add, fromUnixTime } from 'date-fns';
import { common } from '~blockml/barrels/common';

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
      unit === common.FractionUnitEnum.Minutes
        ? add(fromUnixTime(Number(currentMinuteTs)), { minutes: integer + 1 })
        : unit === common.FractionUnitEnum.Hours
          ? add(fromUnixTime(Number(currentHourTs)), { hours: integer + 1 })
          : unit === common.FractionUnitEnum.Days
            ? add(fromUnixTime(Number(currentDateTs)), { days: integer + 1 })
            : unit === common.FractionUnitEnum.Weeks
              ? add(fromUnixTime(Number(currentWeekStartTs)), {
                  days: integer * 7 + 1 * 7
                })
              : unit === common.FractionUnitEnum.Months
                ? add(fromUnixTime(Number(currentMonthTs)), {
                    months: integer + 1
                  })
                : unit === common.FractionUnitEnum.Quarters
                  ? add(fromUnixTime(Number(currentQuarterTs)), {
                      months: integer * 3 + 1 * 3
                    })
                  : unit === common.FractionUnitEnum.Years
                    ? add(fromUnixTime(Number(currentYearTs)), {
                        years: integer + 1
                      })
                    : undefined;
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `TIMESTAMP_ADD(${currentMinuteTs}, INTERVAL ${integer} + 1 MINUTE)`
            : unit === common.FractionUnitEnum.Hours
              ? `TIMESTAMP_ADD(${currentHourTs}, INTERVAL ${integer} + 1 HOUR)`
              : unit === common.FractionUnitEnum.Days
                ? `TIMESTAMP_ADD(${currentDateTs}, INTERVAL ${integer} + 1 DAY)`
                : unit === common.FractionUnitEnum.Weeks
                  ? `TIMESTAMP_ADD(${currentWeekStartTs}, INTERVAL ${integer}*7 + 1*7 DAY)`
                  : unit === common.FractionUnitEnum.Months
                    ? `CAST(DATE_ADD(CAST(${currentMonthTs} AS DATE), ` +
                      `INTERVAL ${integer} + 1 MONTH) AS TIMESTAMP)`
                    : unit === common.FractionUnitEnum.Quarters
                      ? `CAST(DATE_ADD(CAST(${currentQuarterTs} AS DATE), ` +
                        `INTERVAL ${integer} + 1 QUARTER) AS TIMESTAMP)`
                      : unit === common.FractionUnitEnum.Years
                        ? `CAST(DATE_ADD(CAST(${currentYearTs} AS DATE), ` +
                          `INTERVAL ${integer} + 1 YEAR) AS TIMESTAMP)`
                        : undefined;
        break;
      }

      case common.ConnectionTypeEnum.PostgreSQL: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `${currentMinuteTs} + INTERVAL '${integer + 1} minute'`
            : unit === common.FractionUnitEnum.Hours
              ? `${currentHourTs} + INTERVAL '${integer + 1} hour'`
              : unit === common.FractionUnitEnum.Days
                ? `${currentDateTs} + INTERVAL '${integer + 1} day'`
                : unit === common.FractionUnitEnum.Weeks
                  ? `${currentWeekStartTs} + INTERVAL '${integer * 7 + 1 * 7} day'`
                  : unit === common.FractionUnitEnum.Months
                    ? `${currentMonthTs} + INTERVAL '${integer + 1} month'`
                    : unit === common.FractionUnitEnum.Quarters
                      ? `${currentQuarterTs} + INTERVAL '${integer * 3 + 1 * 3} month'`
                      : unit === common.FractionUnitEnum.Years
                        ? `${currentYearTs} + INTERVAL '${integer + 1} year'`
                        : undefined;
        break;
      }

      case common.ConnectionTypeEnum.ClickHouse: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `addMinutes(${currentMinuteTs}, ${integer + 1})`
            : unit === common.FractionUnitEnum.Hours
              ? `addHours(${currentHourTs}, ${integer + 1})`
              : unit === common.FractionUnitEnum.Days
                ? `addDays(${currentDateTs}, ${integer + 1})`
                : unit === common.FractionUnitEnum.Weeks
                  ? `addDays(${currentWeekStartTs}, ${integer * 7 + 1 * 7})`
                  : unit === common.FractionUnitEnum.Months
                    ? `addMonths(${currentMonthTs}, ${integer + 1})`
                    : unit === common.FractionUnitEnum.Quarters
                      ? `addMonths(${currentQuarterTs}, ${integer * 3 + 1 * 3})`
                      : unit === common.FractionUnitEnum.Years
                        ? `addYears(${currentYearTs}, ${integer + 1})`
                        : undefined;
        break;
      }

      case common.ConnectionTypeEnum.SnowFlake: {
        sqlOpen =
          unit === common.FractionUnitEnum.Minutes
            ? `${currentMinuteTs} + INTERVAL '${integer + 1} minute'`
            : unit === common.FractionUnitEnum.Hours
              ? `${currentHourTs} + INTERVAL '${integer + 1} hour'`
              : unit === common.FractionUnitEnum.Days
                ? `${currentDateTs} + INTERVAL '${integer + 1} day'`
                : unit === common.FractionUnitEnum.Weeks
                  ? `${currentWeekStartTs} + INTERVAL '${integer * 7 + 1 * 7} day'`
                  : unit === common.FractionUnitEnum.Months
                    ? `${currentMonthTs} + INTERVAL '${integer + 1} month'`
                    : unit === common.FractionUnitEnum.Quarters
                      ? `${currentQuarterTs} + INTERVAL '${integer * 3 + 1 * 3} month'`
                      : unit === common.FractionUnitEnum.Years
                        ? `${currentYearTs} + INTERVAL '${integer + 1} year'`
                        : undefined;
        break;
      }
    }
  }

  return { sqlOpen, rgOpen };
}

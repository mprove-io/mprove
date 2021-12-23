import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';

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
    currentMinuteTs
  } = item;

  let sql;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql =
        unit === enums.FractionUnitEnum.Minutes
          ? `TIMESTAMP_ADD(${currentMinuteTs}, INTERVAL 1 MINUTE)`
          : unit === enums.FractionUnitEnum.Hours
          ? `TIMESTAMP_ADD(${currentHourTs}, INTERVAL 1 HOUR)`
          : unit === enums.FractionUnitEnum.Days
          ? `TIMESTAMP_ADD(${currentDateTs}, INTERVAL 1 DAY)`
          : unit === enums.FractionUnitEnum.Weeks
          ? `TIMESTAMP_ADD(${currentWeekStartTs}, INTERVAL 1*7 DAY)`
          : unit === enums.FractionUnitEnum.Months
          ? `CAST(DATE_ADD(CAST(${currentMonthTs} AS DATE), INTERVAL 1 MONTH) AS TIMESTAMP)`
          : unit === enums.FractionUnitEnum.Quarters
          ? `CAST(DATE_ADD(CAST(${currentQuarterTs} AS DATE), INTERVAL 1 QUARTER) AS TIMESTAMP)`
          : unit === enums.FractionUnitEnum.Years
          ? `CAST(DATE_ADD(CAST(${currentYearTs} AS DATE), INTERVAL 1 YEAR) AS TIMESTAMP)`
          : undefined;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql =
        unit === enums.FractionUnitEnum.Minutes
          ? `${currentMinuteTs} + INTERVAL '1 minute'`
          : unit === enums.FractionUnitEnum.Hours
          ? `${currentHourTs} + INTERVAL '1 hour'`
          : unit === enums.FractionUnitEnum.Days
          ? `${currentDateTs} + INTERVAL '1 day'`
          : unit === enums.FractionUnitEnum.Weeks
          ? `${currentWeekStartTs} + INTERVAL '${1 * 7} day'`
          : unit === enums.FractionUnitEnum.Months
          ? `${currentMonthTs} + INTERVAL '1 month'`
          : unit === enums.FractionUnitEnum.Quarters
          ? `${currentQuarterTs} + INTERVAL '${1 * 3} month'`
          : unit === enums.FractionUnitEnum.Years
          ? `${currentYearTs} + INTERVAL '1 year'`
          : undefined;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql =
        unit === enums.FractionUnitEnum.Minutes
          ? `addMinutes(${currentMinuteTs}, 1)`
          : unit === enums.FractionUnitEnum.Hours
          ? `addHours(${currentHourTs}, 1)`
          : unit === enums.FractionUnitEnum.Days
          ? `addDays(${currentDateTs}, 1)`
          : unit === enums.FractionUnitEnum.Weeks
          ? `addDays(${currentWeekStartTs}, ${1 * 7})`
          : unit === enums.FractionUnitEnum.Months
          ? `addMonths(${currentMonthTs}, 1)`
          : unit === enums.FractionUnitEnum.Quarters
          ? `addMonths(${currentQuarterTs}, ${1 * 3})`
          : unit === enums.FractionUnitEnum.Years
          ? `addYears(${currentYearTs}, 1)`
          : undefined;
      break;
    }
  }

  return sql;
}

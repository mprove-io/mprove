import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';

export function makeTimestampCloseLastCompletePlusCurrent(item: {
  connection: api.ProjectConnectionEnum;
  unit: string;
  integer: number;
  current_year_ts: string;
  current_quarter_ts: string;
  current_month_ts: string;
  current_week_start_ts: string;
  current_date_ts: string;
  current_hour_ts: string;
  current_minute_ts: string;
}) {
  let unit = item.unit;
  let currentYearTimestamp = item.current_year_ts;
  let currentQuarterTimestamp = item.current_quarter_ts;
  let currentMonthTimestamp = item.current_month_ts;
  let currentWeekStartTimestamp = item.current_week_start_ts;
  let currentDateTimestamp = item.current_date_ts;
  let currentHourTimestamp = item.current_hour_ts;
  let currentMinuteTimestamp = item.current_minute_ts;

  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql =
      unit === enums.FractionUnitEnum.Minutes
        ? `TIMESTAMP_ADD(${currentMinuteTimestamp}, INTERVAL 1 MINUTE)`
        : unit === enums.FractionUnitEnum.Hours
        ? `TIMESTAMP_ADD(${currentHourTimestamp}, INTERVAL 1 HOUR)`
        : unit === enums.FractionUnitEnum.Days
        ? `TIMESTAMP_ADD(${currentDateTimestamp}, INTERVAL 1 DAY)`
        : unit === enums.FractionUnitEnum.Weeks
        ? `TIMESTAMP_ADD(${currentWeekStartTimestamp}, INTERVAL 1*7 DAY)`
        : unit === enums.FractionUnitEnum.Months
        ? `CAST(DATE_ADD(CAST(${currentMonthTimestamp} AS DATE), INTERVAL 1 MONTH) AS TIMESTAMP)`
        : unit === enums.FractionUnitEnum.Quarters
        ? `CAST(DATE_ADD(CAST(${currentQuarterTimestamp} AS DATE), INTERVAL 1 QUARTER) AS TIMESTAMP)`
        : unit === enums.FractionUnitEnum.Years
        ? `CAST(DATE_ADD(CAST(${currentYearTimestamp} AS DATE), INTERVAL 1 YEAR) AS TIMESTAMP)`
        : undefined;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql =
      unit === enums.FractionUnitEnum.Minutes
        ? `${currentMinuteTimestamp} + INTERVAL '1 minute'`
        : unit === enums.FractionUnitEnum.Hours
        ? `${currentHourTimestamp} + INTERVAL '1 hour'`
        : unit === enums.FractionUnitEnum.Days
        ? `${currentDateTimestamp} + INTERVAL '1 day'`
        : unit === enums.FractionUnitEnum.Weeks
        ? `${currentWeekStartTimestamp} + INTERVAL '${1 * 7} day'`
        : unit === enums.FractionUnitEnum.Months
        ? `${currentMonthTimestamp} + INTERVAL '1 month'`
        : unit === enums.FractionUnitEnum.Quarters
        ? `${currentQuarterTimestamp} + INTERVAL '${1 * 3} month'`
        : unit === enums.FractionUnitEnum.Years
        ? `${currentYearTimestamp} + INTERVAL '1 year'`
        : undefined;
  }

  return sql;
}

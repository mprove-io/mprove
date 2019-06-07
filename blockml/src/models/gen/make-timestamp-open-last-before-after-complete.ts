import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';

export function makeTimestampOpenLastBeforeAfterComplete(item: {
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
  let integer = item.integer;
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
        ? `TIMESTAMP_ADD(${currentMinuteTimestamp}, INTERVAL -${integer} MINUTE)`
        : unit === enums.FractionUnitEnum.Hours
        ? `TIMESTAMP_ADD(${currentHourTimestamp}, INTERVAL -${integer} HOUR)`
        : unit === enums.FractionUnitEnum.Days
        ? `TIMESTAMP_ADD(${currentDateTimestamp}, INTERVAL -${integer} DAY)`
        : unit === enums.FractionUnitEnum.Weeks
        ? `TIMESTAMP_ADD(${currentWeekStartTimestamp}, INTERVAL -${integer}*7 DAY)`
        : unit === enums.FractionUnitEnum.Months
        ? `CAST(DATE_ADD(CAST(${currentMonthTimestamp} AS DATE), ` +
          `INTERVAL -${integer} MONTH) AS TIMESTAMP)`
        : unit === enums.FractionUnitEnum.Quarters
        ? `CAST(DATE_ADD(CAST(${currentQuarterTimestamp} AS DATE), ` +
          `INTERVAL -${integer} QUARTER) AS TIMESTAMP)`
        : unit === enums.FractionUnitEnum.Years
        ? `CAST(DATE_ADD(CAST(${currentYearTimestamp} AS DATE), ` +
          `INTERVAL -${integer} YEAR) AS TIMESTAMP)`
        : undefined;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql =
      unit === enums.FractionUnitEnum.Minutes
        ? `${currentMinuteTimestamp} + INTERVAL '-${integer} minute'`
        : unit === enums.FractionUnitEnum.Hours
        ? `${currentHourTimestamp} + INTERVAL '-${integer} hour'`
        : unit === enums.FractionUnitEnum.Days
        ? `${currentDateTimestamp} + INTERVAL '-${integer} day'`
        : unit === enums.FractionUnitEnum.Weeks
        ? `${currentWeekStartTimestamp} + INTERVAL '-${integer * 7} day'`
        : unit === enums.FractionUnitEnum.Months
        ? `${currentMonthTimestamp} + INTERVAL '-${integer} month'`
        : unit === enums.FractionUnitEnum.Quarters
        ? `${currentQuarterTimestamp} + INTERVAL '-${integer * 3} month'`
        : unit === enums.FractionUnitEnum.Years
        ? `${currentYearTimestamp} + INTERVAL '-${integer} year'`
        : undefined;
  }

  return sql;
}

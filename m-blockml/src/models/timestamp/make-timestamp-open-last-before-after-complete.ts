import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';

export function makeTimestampOpenLastBeforeAfterComplete(item: {
  connection: api.ProjectConnection;
  unit: string;
  integer: number;
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
    integer,
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
    case api.ConnectionTypeEnum.BigQuery: {
      sql =
        unit === enums.FractionUnitEnum.Minutes
          ? `TIMESTAMP_ADD(${currentMinuteTs}, INTERVAL -${integer} MINUTE)`
          : unit === enums.FractionUnitEnum.Hours
          ? `TIMESTAMP_ADD(${currentHourTs}, INTERVAL -${integer} HOUR)`
          : unit === enums.FractionUnitEnum.Days
          ? `TIMESTAMP_ADD(${currentDateTs}, INTERVAL -${integer} DAY)`
          : unit === enums.FractionUnitEnum.Weeks
          ? `TIMESTAMP_ADD(${currentWeekStartTs}, INTERVAL -${integer}*7 DAY)`
          : unit === enums.FractionUnitEnum.Months
          ? `CAST(DATE_ADD(CAST(${currentMonthTs} AS DATE), ` +
            `INTERVAL -${integer} MONTH) AS TIMESTAMP)`
          : unit === enums.FractionUnitEnum.Quarters
          ? `CAST(DATE_ADD(CAST(${currentQuarterTs} AS DATE), ` +
            `INTERVAL -${integer} QUARTER) AS TIMESTAMP)`
          : unit === enums.FractionUnitEnum.Years
          ? `CAST(DATE_ADD(CAST(${currentYearTs} AS DATE), ` +
            `INTERVAL -${integer} YEAR) AS TIMESTAMP)`
          : undefined;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql =
        unit === enums.FractionUnitEnum.Minutes
          ? `${currentMinuteTs} + INTERVAL '-${integer} minute'`
          : unit === enums.FractionUnitEnum.Hours
          ? `${currentHourTs} + INTERVAL '-${integer} hour'`
          : unit === enums.FractionUnitEnum.Days
          ? `${currentDateTs} + INTERVAL '-${integer} day'`
          : unit === enums.FractionUnitEnum.Weeks
          ? `${currentWeekStartTs} + INTERVAL '-${integer * 7} day'`
          : unit === enums.FractionUnitEnum.Months
          ? `${currentMonthTs} + INTERVAL '-${integer} month'`
          : unit === enums.FractionUnitEnum.Quarters
          ? `${currentQuarterTs} + INTERVAL '-${integer * 3} month'`
          : unit === enums.FractionUnitEnum.Years
          ? `${currentYearTs} + INTERVAL '-${integer} year'`
          : undefined;
      break;
    }
  }

  return sql;
}

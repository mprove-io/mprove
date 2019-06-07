import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';

export function makeTimestampOpenBeforeAfterInFuture(item: {
  connection: api.ProjectConnectionEnum;
  unit: string;
  integer: number;
  current_ts: string;
}) {
  let unit = item.unit;
  let integer = item.integer;
  let currentTimestamp = item.current_ts;

  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql =
      unit === enums.FractionUnitEnum.Minutes
        ? `TIMESTAMP_ADD(${currentTimestamp}, INTERVAL ${integer} MINUTE)`
        : unit === enums.FractionUnitEnum.Hours
        ? `TIMESTAMP_ADD(${currentTimestamp}, INTERVAL ${integer} HOUR)`
        : unit === enums.FractionUnitEnum.Days
        ? `TIMESTAMP_ADD(${currentTimestamp}, INTERVAL ${integer} DAY)`
        : unit === enums.FractionUnitEnum.Weeks
        ? `TIMESTAMP_ADD(${currentTimestamp}, INTERVAL ${integer}*7 DAY)`
        : unit === enums.FractionUnitEnum.Months
        ? `CAST(DATE_ADD(CAST(${currentTimestamp} AS DATE), ` +
          `INTERVAL ${integer} MONTH) AS TIMESTAMP)`
        : unit === enums.FractionUnitEnum.Quarters
        ? `CAST(DATE_ADD(CAST(${currentTimestamp} AS DATE), ` +
          `INTERVAL ${integer} QUARTER) AS TIMESTAMP)`
        : unit === enums.FractionUnitEnum.Years
        ? `CAST(DATE_ADD(CAST(${currentTimestamp} AS DATE), ` +
          `INTERVAL ${integer} YEAR) AS TIMESTAMP)`
        : undefined;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql =
      unit === enums.FractionUnitEnum.Minutes
        ? `${currentTimestamp} + INTERVAL '${integer} minute'`
        : unit === enums.FractionUnitEnum.Hours
        ? `${currentTimestamp} + INTERVAL '${integer} hour'`
        : unit === enums.FractionUnitEnum.Days
        ? `${currentTimestamp} + INTERVAL '${integer} day'`
        : unit === enums.FractionUnitEnum.Weeks
        ? `${currentTimestamp} + INTERVAL '${integer * 7} day'`
        : unit === enums.FractionUnitEnum.Months
        ? `${currentTimestamp} + INTERVAL '${integer} month'`
        : unit === enums.FractionUnitEnum.Quarters
        ? `${currentTimestamp} + INTERVAL '${integer * 3} month'`
        : unit === enums.FractionUnitEnum.Years
        ? `${currentTimestamp} + INTERVAL '${integer} year'`
        : undefined;
  }

  return sql;
}

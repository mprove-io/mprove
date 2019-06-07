import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';

export function makeTimestampCloseBeforeAfterForUnit(item: {
  connection: api.ProjectConnectionEnum;
  for_unit: string;
  s_integer: number;
  open: string;
}) {
  let forUnit = item.for_unit;
  let open = item.open;
  let sInteger = item.s_integer;

  let sql;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    sql =
      forUnit === enums.FractionUnitEnum.Minutes
        ? `TIMESTAMP_ADD(${open}, INTERVAL ${sInteger} MINUTE)`
        : forUnit === enums.FractionUnitEnum.Hours
        ? `TIMESTAMP_ADD(${open}, INTERVAL ${sInteger} HOUR)`
        : forUnit === enums.FractionUnitEnum.Days
        ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL ${sInteger} DAY) AS TIMESTAMP)`
        : forUnit === enums.FractionUnitEnum.Weeks
        ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL ${sInteger}*7 DAY) AS TIMESTAMP)`
        : forUnit === enums.FractionUnitEnum.Months
        ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL ${sInteger} MONTH) AS TIMESTAMP)`
        : forUnit === enums.FractionUnitEnum.Quarters
        ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL ${sInteger} QUARTER) AS TIMESTAMP)`
        : forUnit === enums.FractionUnitEnum.Years
        ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL ${sInteger} YEAR) AS TIMESTAMP)`
        : undefined;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    sql =
      forUnit === enums.FractionUnitEnum.Minutes
        ? `${open} + INTERVAL '${sInteger} minute'`
        : forUnit === enums.FractionUnitEnum.Hours
        ? `${open} + INTERVAL '${sInteger} hour'`
        : forUnit === enums.FractionUnitEnum.Days
        ? `${open} + INTERVAL '${sInteger} day'`
        : forUnit === enums.FractionUnitEnum.Weeks
        ? `${open} + INTERVAL '${sInteger * 7} day'`
        : forUnit === enums.FractionUnitEnum.Months
        ? `${open} + INTERVAL '${sInteger} month'`
        : forUnit === enums.FractionUnitEnum.Quarters
        ? `${open} + INTERVAL '${sInteger * 3} month'`
        : forUnit === enums.FractionUnitEnum.Years
        ? `${open} + INTERVAL '${sInteger} year'`
        : undefined;
  }

  return sql;
}

import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';

export function makeTimestampOpenBeforeAfterInFuture(item: {
  connection: common.ProjectConnection;
  unit: string;
  integer: number;
  currentTs: string;
}) {
  let { connection, unit, integer, currentTs } = item;

  let sql;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql =
        unit === enums.FractionUnitEnum.Minutes
          ? `TIMESTAMP_ADD(${currentTs}, INTERVAL ${integer} MINUTE)`
          : unit === enums.FractionUnitEnum.Hours
          ? `TIMESTAMP_ADD(${currentTs}, INTERVAL ${integer} HOUR)`
          : unit === enums.FractionUnitEnum.Days
          ? `TIMESTAMP_ADD(${currentTs}, INTERVAL ${integer} DAY)`
          : unit === enums.FractionUnitEnum.Weeks
          ? `TIMESTAMP_ADD(${currentTs}, INTERVAL ${integer}*7 DAY)`
          : unit === enums.FractionUnitEnum.Months
          ? `CAST(DATE_ADD(CAST(${currentTs} AS DATE), ` +
            `INTERVAL ${integer} MONTH) AS TIMESTAMP)`
          : unit === enums.FractionUnitEnum.Quarters
          ? `CAST(DATE_ADD(CAST(${currentTs} AS DATE), ` +
            `INTERVAL ${integer} QUARTER) AS TIMESTAMP)`
          : unit === enums.FractionUnitEnum.Years
          ? `CAST(DATE_ADD(CAST(${currentTs} AS DATE), ` +
            `INTERVAL ${integer} YEAR) AS TIMESTAMP)`
          : undefined;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql =
        unit === enums.FractionUnitEnum.Minutes
          ? `${currentTs} + INTERVAL '${integer} minute'`
          : unit === enums.FractionUnitEnum.Hours
          ? `${currentTs} + INTERVAL '${integer} hour'`
          : unit === enums.FractionUnitEnum.Days
          ? `${currentTs} + INTERVAL '${integer} day'`
          : unit === enums.FractionUnitEnum.Weeks
          ? `${currentTs} + INTERVAL '${integer * 7} day'`
          : unit === enums.FractionUnitEnum.Months
          ? `${currentTs} + INTERVAL '${integer} month'`
          : unit === enums.FractionUnitEnum.Quarters
          ? `${currentTs} + INTERVAL '${integer * 3} month'`
          : unit === enums.FractionUnitEnum.Years
          ? `${currentTs} + INTERVAL '${integer} year'`
          : undefined;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql =
        unit === enums.FractionUnitEnum.Minutes
          ? `addMinutes(${currentTs}, ${integer})`
          : unit === enums.FractionUnitEnum.Hours
          ? `addHours(${currentTs}, ${integer})`
          : unit === enums.FractionUnitEnum.Days
          ? `addDays(${currentTs}, ${integer})`
          : unit === enums.FractionUnitEnum.Weeks
          ? `addDays(${currentTs}, ${integer * 7})`
          : unit === enums.FractionUnitEnum.Months
          ? `addMonths(${currentTs}, ${integer})`
          : unit === enums.FractionUnitEnum.Quarters
          ? `addMonths(${currentTs}, ${integer * 3})`
          : unit === enums.FractionUnitEnum.Years
          ? `addYears(${currentTs}, ${integer})`
          : undefined;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql =
        unit === enums.FractionUnitEnum.Minutes
          ? `${currentTs} + INTERVAL '${integer} minute'`
          : unit === enums.FractionUnitEnum.Hours
          ? `${currentTs} + INTERVAL '${integer} hour'`
          : unit === enums.FractionUnitEnum.Days
          ? `${currentTs} + INTERVAL '${integer} day'`
          : unit === enums.FractionUnitEnum.Weeks
          ? `${currentTs} + INTERVAL '${integer * 7} day'`
          : unit === enums.FractionUnitEnum.Months
          ? `${currentTs} + INTERVAL '${integer} month'`
          : unit === enums.FractionUnitEnum.Quarters
          ? `${currentTs} + INTERVAL '${integer * 3} month'`
          : unit === enums.FractionUnitEnum.Years
          ? `${currentTs} + INTERVAL '${integer} year'`
          : undefined;
      break;
    }
  }

  return sql;
}

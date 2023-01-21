import { add } from 'date-fns';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';

export function makeTimestampCloseBeforeAfterForUnit(item: {
  connection: common.ProjectConnection;
  forUnit: string;
  sInteger: number;
  open: string;
  getTimeRange: boolean;
  rangeOpen: Date;
}) {
  let { connection, forUnit, sInteger, open, getTimeRange, rangeOpen } = item;

  let sqlClose;
  let rgClose;

  if (getTimeRange === true) {
    rgClose =
      forUnit === enums.FractionUnitEnum.Minutes
        ? add(rangeOpen, { minutes: sInteger })
        : forUnit === enums.FractionUnitEnum.Hours
        ? add(rangeOpen, { hours: sInteger })
        : forUnit === enums.FractionUnitEnum.Days
        ? add(rangeOpen, { days: sInteger })
        : forUnit === enums.FractionUnitEnum.Weeks
        ? add(rangeOpen, { days: sInteger * 7 })
        : forUnit === enums.FractionUnitEnum.Months
        ? add(rangeOpen, { months: sInteger })
        : forUnit === enums.FractionUnitEnum.Quarters
        ? add(rangeOpen, { months: sInteger * 3 })
        : forUnit === enums.FractionUnitEnum.Years
        ? add(rangeOpen, { years: sInteger })
        : undefined;
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        sqlClose =
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
        break;
      }

      case common.ConnectionTypeEnum.PostgreSQL: {
        sqlClose =
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
        break;
      }

      case common.ConnectionTypeEnum.ClickHouse: {
        sqlClose =
          forUnit === enums.FractionUnitEnum.Minutes
            ? `addMinutes(${open}, ${sInteger})`
            : forUnit === enums.FractionUnitEnum.Hours
            ? `addHours(${open}, ${sInteger})`
            : forUnit === enums.FractionUnitEnum.Days
            ? `addDays(${open}, ${sInteger})`
            : forUnit === enums.FractionUnitEnum.Weeks
            ? `addDays(${open}, ${sInteger * 7})`
            : forUnit === enums.FractionUnitEnum.Months
            ? `addMonths(${open}, ${sInteger})`
            : forUnit === enums.FractionUnitEnum.Quarters
            ? `addMonths(${open}, ${sInteger * 3})`
            : forUnit === enums.FractionUnitEnum.Years
            ? `addYears(${open}, ${sInteger})`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.SnowFlake: {
        sqlClose =
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
        break;
      }
    }
  }

  return { sqlClose, rgClose };
}

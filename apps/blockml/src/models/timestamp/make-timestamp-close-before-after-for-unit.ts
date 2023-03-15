import { add } from 'date-fns';
import { common } from '~blockml/barrels/common';

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
      forUnit === common.FractionUnitEnum.Minutes
        ? add(rangeOpen, { minutes: sInteger })
        : forUnit === common.FractionUnitEnum.Hours
        ? add(rangeOpen, { hours: sInteger })
        : forUnit === common.FractionUnitEnum.Days
        ? add(rangeOpen, { days: sInteger })
        : forUnit === common.FractionUnitEnum.Weeks
        ? add(rangeOpen, { days: sInteger * 7 })
        : forUnit === common.FractionUnitEnum.Months
        ? add(rangeOpen, { months: sInteger })
        : forUnit === common.FractionUnitEnum.Quarters
        ? add(rangeOpen, { months: sInteger * 3 })
        : forUnit === common.FractionUnitEnum.Years
        ? add(rangeOpen, { years: sInteger })
        : undefined;
  } else {
    switch (connection.type) {
      case common.ConnectionTypeEnum.BigQuery: {
        sqlClose =
          forUnit === common.FractionUnitEnum.Minutes
            ? `TIMESTAMP_ADD(${open}, INTERVAL ${sInteger} MINUTE)`
            : forUnit === common.FractionUnitEnum.Hours
            ? `TIMESTAMP_ADD(${open}, INTERVAL ${sInteger} HOUR)`
            : forUnit === common.FractionUnitEnum.Days
            ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL ${sInteger} DAY) AS TIMESTAMP)`
            : forUnit === common.FractionUnitEnum.Weeks
            ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL ${sInteger}*7 DAY) AS TIMESTAMP)`
            : forUnit === common.FractionUnitEnum.Months
            ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL ${sInteger} MONTH) AS TIMESTAMP)`
            : forUnit === common.FractionUnitEnum.Quarters
            ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL ${sInteger} QUARTER) AS TIMESTAMP)`
            : forUnit === common.FractionUnitEnum.Years
            ? `CAST(DATE_ADD(CAST(${open} AS DATE), INTERVAL ${sInteger} YEAR) AS TIMESTAMP)`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.PostgreSQL: {
        sqlClose =
          forUnit === common.FractionUnitEnum.Minutes
            ? `${open} + INTERVAL '${sInteger} minute'`
            : forUnit === common.FractionUnitEnum.Hours
            ? `${open} + INTERVAL '${sInteger} hour'`
            : forUnit === common.FractionUnitEnum.Days
            ? `${open} + INTERVAL '${sInteger} day'`
            : forUnit === common.FractionUnitEnum.Weeks
            ? `${open} + INTERVAL '${sInteger * 7} day'`
            : forUnit === common.FractionUnitEnum.Months
            ? `${open} + INTERVAL '${sInteger} month'`
            : forUnit === common.FractionUnitEnum.Quarters
            ? `${open} + INTERVAL '${sInteger * 3} month'`
            : forUnit === common.FractionUnitEnum.Years
            ? `${open} + INTERVAL '${sInteger} year'`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.ClickHouse: {
        sqlClose =
          forUnit === common.FractionUnitEnum.Minutes
            ? `addMinutes(${open}, ${sInteger})`
            : forUnit === common.FractionUnitEnum.Hours
            ? `addHours(${open}, ${sInteger})`
            : forUnit === common.FractionUnitEnum.Days
            ? `addDays(${open}, ${sInteger})`
            : forUnit === common.FractionUnitEnum.Weeks
            ? `addDays(${open}, ${sInteger * 7})`
            : forUnit === common.FractionUnitEnum.Months
            ? `addMonths(${open}, ${sInteger})`
            : forUnit === common.FractionUnitEnum.Quarters
            ? `addMonths(${open}, ${sInteger * 3})`
            : forUnit === common.FractionUnitEnum.Years
            ? `addYears(${open}, ${sInteger})`
            : undefined;
        break;
      }

      case common.ConnectionTypeEnum.SnowFlake: {
        sqlClose =
          forUnit === common.FractionUnitEnum.Minutes
            ? `${open} + INTERVAL '${sInteger} minute'`
            : forUnit === common.FractionUnitEnum.Hours
            ? `${open} + INTERVAL '${sInteger} hour'`
            : forUnit === common.FractionUnitEnum.Days
            ? `${open} + INTERVAL '${sInteger} day'`
            : forUnit === common.FractionUnitEnum.Weeks
            ? `${open} + INTERVAL '${sInteger * 7} day'`
            : forUnit === common.FractionUnitEnum.Months
            ? `${open} + INTERVAL '${sInteger} month'`
            : forUnit === common.FractionUnitEnum.Quarters
            ? `${open} + INTERVAL '${sInteger * 3} month'`
            : forUnit === common.FractionUnitEnum.Years
            ? `${open} + INTERVAL '${sInteger} year'`
            : undefined;
        break;
      }
    }
  }

  return { sqlClose, rgClose };
}

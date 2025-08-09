import { common } from '~node-common/barrels/common';
import { timeRangeMakeCurrentTimestamps } from './time-range-make-current-timestamps';

export function getCurrentUnitStartTs(item: {
  unit: common.FractionTsUnitEnum;
  timezone: string;
  weekStart: common.ProjectWeekStartEnum;
}) {
  let { unit, timezone, weekStart } = item;

  let {
    currentTs,
    currentSecondTs,
    currentMinuteTs,
    currentHourTs,
    currentDateTs,
    currentWeekStartTs,
    currentMonthTs,
    currentQuarterTs,
    currentYearTs
  } = timeRangeMakeCurrentTimestamps({
    timezone: timezone,
    weekStart: weekStart
  });

  let currentUnitStartTs =
    unit === common.FractionTsUnitEnum.Years
      ? currentYearTs
      : unit === common.FractionTsUnitEnum.Quarters
        ? currentQuarterTs
        : unit === common.FractionTsUnitEnum.Months
          ? currentMonthTs
          : unit === common.FractionTsUnitEnum.Weeks
            ? currentWeekStartTs
            : unit === common.FractionTsUnitEnum.Days
              ? currentDateTs
              : unit === common.FractionTsUnitEnum.Hours
                ? currentHourTs
                : unit === common.FractionTsUnitEnum.Minutes
                  ? currentMinuteTs
                  : unit === common.FractionTsUnitEnum.Seconds
                    ? currentSecondTs
                    : undefined;

  return currentUnitStartTs;
}

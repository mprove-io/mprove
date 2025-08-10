import { common } from '~node-common/barrels/common';
import { timeRangeMakeCurrentTimestamps } from './time-range-make-current-timestamps';

export function getCurrentUnitStartTs(item: {
  unit: common.FractionTsUnitEnum;
  timezone: string;
  weekStart: common.ProjectWeekStartEnum;
}) {
  let { unit, timezone, weekStart } = item;

  let timestampsResult = timeRangeMakeCurrentTimestamps({
    timezone: timezone,
    weekStart: weekStart
  });

  let currentUnitStartTs =
    unit === common.FractionTsUnitEnum.Years
      ? timestampsResult.currentYearTs
      : unit === common.FractionTsUnitEnum.Quarters
        ? timestampsResult.currentQuarterTs
        : unit === common.FractionTsUnitEnum.Months
          ? timestampsResult.currentMonthTs
          : unit === common.FractionTsUnitEnum.Weeks
            ? timestampsResult.currentWeekStartTs
            : unit === common.FractionTsUnitEnum.Days
              ? timestampsResult.currentDateTs
              : unit === common.FractionTsUnitEnum.Hours
                ? timestampsResult.currentHourTs
                : unit === common.FractionTsUnitEnum.Minutes
                  ? timestampsResult.currentMinuteTs
                  : unit === common.FractionTsUnitEnum.Seconds
                    ? timestampsResult.currentSecondTs
                    : undefined;

  return currentUnitStartTs;
}

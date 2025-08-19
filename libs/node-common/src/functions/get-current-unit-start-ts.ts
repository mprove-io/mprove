import { FractionTsUnitEnum } from '~common/enums/fraction/fraction-ts-unit.enum';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { timeRangeMakeCurrentTimestamps } from './time-range-make-current-timestamps';

export function getCurrentUnitStartTs(item: {
  unit: FractionTsUnitEnum;
  timezone: string;
  weekStart: ProjectWeekStartEnum;
}) {
  let { unit, timezone, weekStart } = item;

  let timestampsResult = timeRangeMakeCurrentTimestamps({
    timezone: timezone,
    weekStart: weekStart
  });

  let currentUnitStartTs =
    unit === FractionTsUnitEnum.Years
      ? timestampsResult.currentYearTs
      : unit === FractionTsUnitEnum.Quarters
        ? timestampsResult.currentQuarterTs
        : unit === FractionTsUnitEnum.Months
          ? timestampsResult.currentMonthTs
          : unit === FractionTsUnitEnum.Weeks
            ? timestampsResult.currentWeekStartTs
            : unit === FractionTsUnitEnum.Days
              ? timestampsResult.currentDateTs
              : unit === FractionTsUnitEnum.Hours
                ? timestampsResult.currentHourTs
                : unit === FractionTsUnitEnum.Minutes
                  ? timestampsResult.currentMinuteTs
                  : unit === FractionTsUnitEnum.Seconds
                    ? timestampsResult.currentSecondTs
                    : undefined;

  return currentUnitStartTs;
}

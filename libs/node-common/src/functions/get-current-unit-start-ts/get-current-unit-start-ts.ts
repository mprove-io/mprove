import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';
import type { FractionTsUnit } from '#common/types/blockml/parts/fraction/fraction-ts-unit';

import { timeRangeMakeCurrentTimestamps } from '#node-common/functions/time-range-make-current-timestamps/time-range-make-current-timestamps';

export function getCurrentUnitStartTs(item: {
  unit: FractionTsUnit;
  timezone: string;
  weekStart: ProjectWeekStart;
}) {
  let { unit, timezone, weekStart } = item;

  let timestampsResult = timeRangeMakeCurrentTimestamps({
    timezone: timezone,
    weekStart: weekStart
  });

  let currentUnitStartTs =
    unit === 'years'
      ? timestampsResult.currentYearTs
      : unit === 'quarters'
        ? timestampsResult.currentQuarterTs
        : unit === 'months'
          ? timestampsResult.currentMonthTs
          : unit === 'weeks'
            ? timestampsResult.currentWeekStartTs
            : unit === 'days'
              ? timestampsResult.currentDateTs
              : unit === 'hours'
                ? timestampsResult.currentHourTs
                : unit === 'minutes'
                  ? timestampsResult.currentMinuteTs
                  : unit === 'seconds'
                    ? timestampsResult.currentSecondTs
                    : undefined;

  return currentUnitStartTs;
}

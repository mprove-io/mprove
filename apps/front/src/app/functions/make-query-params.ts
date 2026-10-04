import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { TimeSpec } from '#common/types/shared/time/timespec';

export function makeQueryParams(item: {
  timezone: string;
  timeSpec: TimeSpec;
  timeRangeFraction: Fraction;
}) {
  let { timezone, timeSpec, timeRangeFraction } = item;

  let queryParams = {
    timezone: timezone,
    timeSpec: timeSpec,
    timeRange: timeRangeFraction?.brick
  };

  return queryParams;
}

import { TimeSpecEnum } from '#common/enums/timespec.enum';
import type { Fraction } from '#common/zod/blockml/fraction';

export function makeQueryParams(item: {
  timezone: string;
  timeSpec: TimeSpecEnum;
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

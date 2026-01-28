import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { Fraction } from '#common/interfaces/blockml/fraction';

export function makeQueryParams(item: {
  timezone: string;
  timeSpec: TimeSpecEnum;
  timeRangeFraction: Fraction;
}) {
  let { timezone, timeSpec, timeRangeFraction } = item;

  let queryParams = {
    timezone: timezone.split('/').join('-'),
    timeSpec: timeSpec,
    timeRange: timeRangeFraction?.brick
  };

  return queryParams;
}

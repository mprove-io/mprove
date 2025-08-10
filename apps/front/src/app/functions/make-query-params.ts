import { common } from '~front/barrels/common';

export function makeQueryParams(item: {
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFraction: common.Fraction;
}) {
  let { timezone, timeSpec, timeRangeFraction } = item;

  let queryParams = {
    timezone: timezone.split('/').join('-'),
    timeSpec: timeSpec,
    timeRange: timeRangeFraction?.brick
    // .split('/')
    // .join('-')
    // .split(' ')
    // .join('_')
    // .split(':')
    // .join('~')
  };

  return queryParams;
}

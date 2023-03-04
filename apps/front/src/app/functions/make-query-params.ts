import { common } from '~front/barrels/common';

export function makeRepQueryParams(item: {
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFraction: common.Fraction;
  selectRowsNodeIds: string[];
}) {
  let { timezone, timeSpec, timeRangeFraction, selectRowsNodeIds } = item;

  let queryParams = {
    timezone: timezone.split('/').join('-'),
    timeSpec: timeSpec,
    timeRange: timeRangeFraction.brick
      .split('/')
      .join('-')
      .split(' ')
      .join('_')
      .split(':')
      .join('~'),
    selectRows:
      selectRowsNodeIds.length > 0 ? selectRowsNodeIds.join('-') : undefined
  };

  // console.log('makeRepQueryParams', queryParams);

  return queryParams;
}

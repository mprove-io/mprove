import { getUnixTime, parseISO } from 'date-fns';
import { common } from '~node-common/barrels/common';

export function getUnixTimeFromDateParts(item: {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}) {
  let { year, month, day, hour, minute } = item;

  // console.log('item');
  // console.log(item);

  let date = common.isDefined(minute)
    ? parseISO(`${year}-${month}-${day}T${hour}:${minute}:00`)
    : common.isDefined(hour)
      ? parseISO(`${year}-${month}-${day}T${hour}:00:00`)
      : common.isDefined(day)
        ? parseISO(`${year}-${month}-${day}`)
        : common.isDefined(month)
          ? parseISO(`${year}-${month}-01`)
          : common.isDefined(year)
            ? parseISO(`${year}-01-01`)
            : undefined;

  // console.log('date');
  // console.log(date);

  let unixTime = common.isDefined(date) ? getUnixTime(date) : undefined;

  return unixTime;
}

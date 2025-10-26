import { getUnixTime, parseISO } from 'date-fns';
import { isDefined } from '~common/functions/is-defined';

export function getUnixTimeFromDateParts(item: {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}) {
  let { year, month, day, hour, minute } = item;

  let date = isDefined(minute)
    ? parseISO(`${year}-${month}-${day}T${hour}:${minute}:00`)
    : isDefined(hour)
      ? parseISO(`${year}-${month}-${day}T${hour}:00:00`)
      : isDefined(day)
        ? parseISO(`${year}-${month}-${day}`)
        : isDefined(month)
          ? parseISO(`${year}-${month}-01`)
          : isDefined(year)
            ? parseISO(`${year}-01-01`)
            : undefined;

  let unixTime = isDefined(date) ? getUnixTime(date) : undefined;

  return unixTime;
}

import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function getCurrentDateYYYYMMDDByTimezone(item: { timezone: string }) {
  let { timezone } = item;

  let now = new Date();
  let zonedDate = toZonedTime(now, timezone);
  let dateInTimezone = format(zonedDate, 'yyyy-MM-dd');

  return dateInTimezone;
}

import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function getYYYYMMDDCurrentDateByTimezone(item: {
  timezone: string;
  deltaDays: number;
}) {
  let { timezone, deltaDays } = item;

  let now = new Date();
  now.setDate(now.getDate() + deltaDays);

  let zonedDate = toZonedTime(now, timezone);
  let dateInTimezone = format(zonedDate, 'yyyy-MM-dd');

  return dateInTimezone;
}

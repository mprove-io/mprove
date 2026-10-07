import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function getYYYYMMDDFromEpochUtcByTimezone(item: {
  secondsEpochUTC: number;
  timezone: string;
}) {
  let { secondsEpochUTC, timezone } = item;

  let date = new Date(secondsEpochUTC * 1000);
  let zonedDate = toZonedTime(date, timezone);
  let dateInTimezone = format(zonedDate, 'yyyy-MM-dd');

  return dateInTimezone;
}

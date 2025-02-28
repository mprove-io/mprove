import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function getYYYYMMDDFromEpochUtcByTimezone(item: {
  secondsEpochUTC: number;
  timezone: string;
}) {
  let { secondsEpochUTC, timezone } = item;

  // Create Date object from seconds since Unix epoch (UTC) by converting to milliseconds
  let date = new Date(secondsEpochUTC * 1000);
  // Convert to specified timezone
  let zonedDate = toZonedTime(date, timezone);
  // Format the date to YYYY-MM-DD
  let dateInTimezone = format(zonedDate, 'yyyy-MM-dd');

  return dateInTimezone;
}

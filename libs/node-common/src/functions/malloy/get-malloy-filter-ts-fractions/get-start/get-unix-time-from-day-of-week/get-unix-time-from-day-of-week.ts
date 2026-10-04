import { add, fromUnixTime, getUnixTime, sub } from 'date-fns';
import { getUnitDuration } from '#node-common/functions/get-unit-duration/get-unit-duration';
import type { RelativeDayDirection } from '#node-common/functions/malloy/get-malloy-filter-ts-fractions/get-start/get-unix-time-from-day-of-week/relative-day-direction';
import type { WeekdayName } from '#node-common/functions/malloy/get-malloy-filter-ts-fractions/get-start/get-unix-time-from-day-of-week/weekday-name';

export function getUnixTimeFromDayOfWeek(item: {
  lastNext: RelativeDayDirection;
  weekday: WeekdayName;
  currentUnitStartTs: number;
}) {
  let { lastNext, weekday, currentUnitStartTs } = item;

  let days = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  let now = new Date();

  let currentDay = now.getDay();

  let targetDay = days[weekday];

  let daysDiff: number;

  if (lastNext === 'next') {
    daysDiff =
      targetDay >= currentDay
        ? targetDay - currentDay
        : 7 - currentDay + targetDay;
  } else {
    daysDiff =
      targetDay <= currentDay
        ? -(currentDay - targetDay)
        : -(currentDay + 7 - targetDay);
  }

  let duration = getUnitDuration({
    value: daysDiff > 0 ? daysDiff : -daysDiff,
    unit: 'days'
  });

  let unixTime =
    daysDiff > 0
      ? getUnixTime(add(fromUnixTime(currentUnitStartTs), duration))
      : getUnixTime(sub(fromUnixTime(currentUnitStartTs), duration));

  return unixTime;
}

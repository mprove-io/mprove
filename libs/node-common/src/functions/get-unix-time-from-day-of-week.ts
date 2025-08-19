import { add, fromUnixTime, getUnixTime, sub } from 'date-fns';
import { FractionTsUnitEnum } from '~common/enums/fraction/fraction-ts-unit.enum';
import { getUnitDuration } from './get-unit-duration';

export function getUnixTimeFromDayOfWeek(item: {
  lastNext: 'last' | 'next';
  weekday:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';
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
    unit: FractionTsUnitEnum.Days
  });

  let unixTime =
    daysDiff > 0
      ? getUnixTime(add(fromUnixTime(currentUnitStartTs), duration))
      : getUnixTime(sub(fromUnixTime(currentUnitStartTs), duration));

  return unixTime;
}

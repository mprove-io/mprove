import { getUserTimezones } from './get-user-timezones';

export function getUserTimezoneLabelByValue(value: string) {
  let userTimezones = getUserTimezones();

  let userTimezone = userTimezones.find(x => x.value === value);

  return userTimezone.label;
}

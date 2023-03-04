import { getUserTimezones } from './get-user-timezones';

export function getUserTimezonesValues() {
  return getUserTimezones().map(timezone => timezone.value);
}

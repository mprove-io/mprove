import { getTimezones } from './get-timezones';

export function getTimezonesValues() {
  return getTimezones().map(timezone => timezone.value);
}

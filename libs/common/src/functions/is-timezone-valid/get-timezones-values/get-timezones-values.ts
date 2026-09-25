import { getTimezones } from '#common/functions/get-timezones/get-timezones';

export function getTimezonesValues() {
  return getTimezones().map(timezone => timezone.value);
}

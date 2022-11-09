import { USE_PROJECT_TIMEZONE_VALUE } from '~common/constants/top';
import { getTimezones } from './get-timezones';

export function getTimezonesValues() {
  return getTimezones()
    .filter(x => x.value !== USE_PROJECT_TIMEZONE_VALUE)
    .map(t => t.value);
}

import { getTimezonesValues } from './get-timezones-values';

export function isTimezoneValid(timezone: string): boolean {
  let isValid = getTimezonesValues().findIndex(v => v === timezone) > -1;

  return isValid;
}

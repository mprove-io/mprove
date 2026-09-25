import { getTimezonesValues } from '#common/functions/is-timezone-valid/get-timezones-values/get-timezones-values';

export function isTimezoneValid(timezone: string): boolean {
  let isValid = getTimezonesValues().findIndex(v => v === timezone) > -1;

  return isValid;
}

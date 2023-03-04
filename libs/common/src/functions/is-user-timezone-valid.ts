import { getUserTimezonesValues } from './get-user-timezones-values';

export function isUserTimezoneValid(timezone: string): boolean {
  let isValid = getUserTimezonesValues().findIndex(v => v === timezone) > -1;

  return isValid;
}

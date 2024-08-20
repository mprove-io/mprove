import {
  USE_PROJECT_TIMEZONE_LABEL,
  USE_PROJECT_TIMEZONE_VALUE
} from '~common/constants/top';
import { getTimezones } from './get-timezones';

export interface TzVL {
  value: string;
  label: string;
}

export function getUserTimezones() {
  let tzs: TzVL[] = getTimezones();

  let userTimezones = [
    {
      value: USE_PROJECT_TIMEZONE_VALUE,
      label: USE_PROJECT_TIMEZONE_LABEL
    },
    ...tzs
  ];

  return userTimezones;
}

import { getTimezones } from './get-timezones';

export function getTimezoneLabelByValue(value: string) {
  let timezones = getTimezones();

  let timezone = timezones.find(x => x.value === value);

  return timezone.label;
}

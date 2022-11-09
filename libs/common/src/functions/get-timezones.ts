import { timezones } from '~common/constants/timezones';
import {
  USE_PROJECT_TIMEZONE_LABEL,
  USE_PROJECT_TIMEZONE_VALUE,
  UTC
} from '~common/constants/top';

export function getTimezones() {
  let tzs: { value: string; label: string }[] = [
    {
      value: USE_PROJECT_TIMEZONE_VALUE,
      label: USE_PROJECT_TIMEZONE_LABEL
    },
    {
      value: UTC,
      label: UTC
    }
  ];

  timezones.forEach(group => {
    group.zones.forEach(zone => {
      tzs.push({
        value: zone.value,
        label: `${group.group} - ${zone.name}`
      });
    });
  });

  return tzs;
}

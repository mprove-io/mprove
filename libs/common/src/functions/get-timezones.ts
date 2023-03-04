import { timezones } from '~common/constants/timezones';
import { UTC } from '~common/_index';

export function getTimezones() {
  let tzs: { value: string; label: string }[] = [
    {
      value: UTC,
      label: UTC
    }
  ];

  timezones.forEach(group => {
    group.zones.forEach(zone => {
      tzs.push({
        value: zone.value,
        label: `${zone.name} - ${group.group}`
      });
    });
  });

  return tzs;
}

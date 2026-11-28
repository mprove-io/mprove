import { timezones } from '#common/constants/timezones';
import { UTC } from '#common/constants/top';

export type TimezoneOption = { value: string; label: string; name: string };

export function getTimezones(): TimezoneOption[] {
  let tzs: TimezoneOption[] = [
    {
      value: UTC,
      label: UTC,
      name: UTC
    }
  ];

  timezones.forEach(group => {
    group.zones.forEach(zone => {
      let nameParts: string[] = zone.name.split(' - ').reverse();

      tzs.push({
        value: zone.value,
        label: [...nameParts, group.group].join(' - '),
        name: nameParts[0]
      });
    });
  });

  return tzs;
}

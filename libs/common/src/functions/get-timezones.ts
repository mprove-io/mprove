import { constants } from '~common/barrels/constants';

export function getTimezones() {
  let timezones: { value: string; label: string }[] = [
    {
      value: constants.USE_PROJECT_TIMEZONE,
      label: 'USE PROJECT CONFIG TIMEZONE'
    },
    {
      value: 'UTC',
      label: 'UTC'
    }
  ];

  constants.timezones.forEach(group => {
    group.zones.forEach(zone => {
      timezones.push({
        value: zone.value,
        label: `${group.group} - ${zone.name}`
      });
    });
  });

  return timezones;
}

import { constants } from '~common/barrels/constants';

export function getTimezones() {
  let timezones: { value: string; label: string }[] = [
    {
      value: constants.USE_PROJECT_TIMEZONE_VALUE,
      label: constants.USE_PROJECT_TIMEZONE_LABEL
    },
    {
      value: constants.UTC,
      label: constants.UTC
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

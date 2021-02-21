import { common } from '~blockml/barrels/common';

export function isTimezoneValid(timezone: string): boolean {
  // let timezonesHash: { [tzValue: string]: number } = {};

  if (timezone === common.UTC) {
    return true;
  }

  let isValid = false;

  common.timezones.forEach(group => {
    if (isValid === true) {
      return;
    }
    if (group.zones.map(z => z.value).indexOf(timezone) > -1) {
      isValid = true;
    }

    // group.zones.forEach(tz => {

    //   timezonesHash[tz.value] = 1;
    // });
  });

  // return Object.keys(timezonesHash).indexOf(timezone) > -1;
  return isValid;
}

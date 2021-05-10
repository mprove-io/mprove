import { common } from '~backend/barrels/common';

export function makeFullName(item: { firstName: string; lastName: string }) {
  return common.isDefined(item.firstName) && common.isDefined(item.lastName)
    ? common.capitalizeFirstLetter(item.firstName) +
        ' ' +
        common.capitalizeFirstLetter(item.lastName)
    : common.isDefined(item.firstName)
    ? common.capitalizeFirstLetter(item.firstName)
    : common.isDefined(item.lastName)
    ? common.capitalizeFirstLetter(item.lastName)
    : undefined;
}

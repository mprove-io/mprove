import { capitalizeFirstLetter } from '~common/functions/capitalize-first-letter';
import { isDefined } from '~common/functions/is-defined';

export function makeFullName(item: { firstName: string; lastName: string }) {
  return isDefined(item.firstName) && isDefined(item.lastName)
    ? capitalizeFirstLetter(item.firstName) +
        ' ' +
        capitalizeFirstLetter(item.lastName)
    : isDefined(item.firstName)
      ? capitalizeFirstLetter(item.firstName)
      : isDefined(item.lastName)
        ? capitalizeFirstLetter(item.lastName)
        : undefined;
}

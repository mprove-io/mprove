import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined';

export function makeInitials(item: {
  firstName: string;
  lastName: string;
  alias: string;
}) {
  let { firstName, lastName, alias } = item;

  let firstLetter =
    isDefined(firstName) && firstName.length > 0 ? firstName[0] : alias[0];

  let secondLetter =
    isDefined(firstName) &&
    firstName.length > 0 &&
    isDefined(lastName) &&
    lastName.length > 0
      ? lastName[0]
      : isDefined(firstName) && firstName.length > 1
        ? firstName[1]
        : alias.length > 1
          ? alias[1]
          : '_';

  return (
    capitalizeFirstLetter(firstLetter) + capitalizeFirstLetter(secondLetter)
  );
}

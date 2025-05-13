import { common } from '~front/barrels/common';

export function makeInitials(item: {
  firstName: string;
  lastName: string;
  alias: string;
}) {
  let { firstName, lastName, alias } = item;

  let firstLetter =
    common.isDefined(firstName) && firstName.length > 0
      ? firstName[0]
      : alias[0];

  let secondLetter =
    common.isDefined(firstName) &&
    firstName.length > 0 &&
    common.isDefined(lastName) &&
    lastName.length > 0
      ? lastName[0]
      : common.isDefined(firstName) && firstName.length > 1
        ? firstName[1]
        : alias.length > 1
          ? alias[1]
          : '_';

  return (
    common.capitalizeFirstLetter(firstLetter) +
    common.capitalizeFirstLetter(secondLetter)
  );
}

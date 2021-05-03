import { common } from '~front/barrels/common';

export function getFullName(x: common.Member | common.User) {
  let firstName = common.capitalizeFirstLetter(x.firstName);
  let lastName = common.capitalizeFirstLetter(x.lastName);

  return common.isDefined(firstName) && common.isDefined(lastName)
    ? `${firstName} ${lastName}`
    : common.isDefined(firstName)
    ? firstName
    : '';
}

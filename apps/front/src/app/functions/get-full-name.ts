import { common } from '~front/barrels/common';

export function getFullName(x: common.Member | common.User) {
  let firstName = common.capitalizeFirstLetter(
    common.isDefined(x.firstName) ? x.firstName : x.alias[0]
  );

  let lastName = common.capitalizeFirstLetter(
    common.isDefined(x.lastName) ? x.lastName : '_'
  );

  return `${firstName} ${lastName}`;
}

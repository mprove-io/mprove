import { capitalizeFirstLetter } from '~common/functions/capitalize-first-letter';
import { isDefined } from '~common/functions/is-defined';
import { Member } from '~common/interfaces/backend/member';
import { User } from '~common/interfaces/backend/user';

export function getFullName(x: Member | User) {
  let firstName = capitalizeFirstLetter(x.firstName);
  let lastName = capitalizeFirstLetter(x.lastName);

  return isDefined(firstName) && isDefined(lastName)
    ? `${firstName} ${lastName}`
    : isDefined(firstName)
      ? firstName
      : '';
}

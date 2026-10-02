import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Member } from '#common/types/backend/parts/member';
import type { User } from '#common/types/backend/parts/user';

export function getFullName(x: Member | User) {
  let firstName = capitalizeFirstLetter(x.firstName);
  let lastName = capitalizeFirstLetter(x.lastName);

  return isDefined(firstName) && isDefined(lastName)
    ? `${firstName} ${lastName}`
    : isDefined(firstName)
      ? firstName
      : '';
}

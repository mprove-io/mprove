import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined';
import type { Member } from '#common/zod/backend/member';
import type { User } from '#common/zod/backend/user';

export function getFullName(x: Member | User) {
  let firstName = capitalizeFirstLetter(x.firstName);
  let lastName = capitalizeFirstLetter(x.lastName);

  return isDefined(firstName) && isDefined(lastName)
    ? `${firstName} ${lastName}`
    : isDefined(firstName)
      ? firstName
      : '';
}

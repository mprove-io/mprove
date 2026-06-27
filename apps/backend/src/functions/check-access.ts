import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import type { AccessRoleCombined } from '#common/zod/access-role-combined';
import type { Member } from '#common/zod/backend/member';

export function checkAccess(item: {
  member: MemberTab | Member;
  accessRoles: AccessRoleCombined[];
  filePath?: string;
}): boolean {
  let { member, accessRoles, filePath } = item;

  if (member.isAdmin === true || member.isEditor === true) {
    return true;
  }

  if (filePath && member.alias) {
    let filePathArray = filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    let author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;

    if (author === member.alias) {
      return true;
    }
  }

  let roles = accessRoles.map(x => x.role);

  return roles.some(x => member.roles.includes(x));
}

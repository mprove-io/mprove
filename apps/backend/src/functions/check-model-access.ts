import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { Member } from '#common/types/backend/parts/member';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export function checkModelAccess(item: {
  member: MemberTab | Member;
  modelAccessRoles: AccessRoleCombined[];
}): boolean {
  let { member, modelAccessRoles } = item;

  if (member.isAdmin === true || member.isEditor === true) {
    return true;
  }

  let accessRoles = modelAccessRoles.map(x => x.role);

  return accessRoles.some(x => member.roles.includes(x));
}

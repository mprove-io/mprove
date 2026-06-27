import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { AccessRoleCombined } from '#common/zod/access-role-combined';
import type { Member } from '#common/zod/backend/member';

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

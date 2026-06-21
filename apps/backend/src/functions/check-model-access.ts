import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { Member } from '#common/zod/backend/member';

export function checkModelAccess(item: {
  member: MemberTab | Member;
  modelAccessRoles: string[];
}): boolean {
  let { member, modelAccessRoles } = item;

  if (member.isAdmin === true || member.isEditor === true) {
    return true;
  }

  return modelAccessRoles.some(x => member.roles.includes(x));
}

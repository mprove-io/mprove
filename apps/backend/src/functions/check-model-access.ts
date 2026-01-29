import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import { Member } from '#common/interfaces/backend/member';

export function checkModelAccess(item: {
  member: MemberTab | Member;
  modelAccessRoles: string[];
}): boolean {
  let { member, modelAccessRoles } = item;

  if (member.isAdmin === true || member.isEditor === true) {
    return true;
  }

  if (modelAccessRoles.length === 0) {
    return true;
  }

  if (modelAccessRoles.some(x => member.roles.includes(x)) === false) {
    return false;
  }

  return true;
}

import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import { Member } from '#common/interfaces/backend/member';

export function checkAccess(item: {
  member: MemberTab | Member;
  accessRoles: string[];
}): boolean {
  let { member, accessRoles } = item;

  if (member.isAdmin === true || member.isEditor === true) {
    return true;
  }

  if (accessRoles.length === 0) {
    return true;
  }

  if (accessRoles.some(x => member.roles.includes(x)) === false) {
    return false;
  }

  return true;
}

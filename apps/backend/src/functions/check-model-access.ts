import { MemberEnx } from '~backend/drizzle/postgres/schema/members';

export function checkModelAccess(item: {
  member: MemberEnx;
  modelAccessRoles: string[];
}): boolean {
  let { member, modelAccessRoles } = item;

  if (member.isExplorer === false) {
    return false;
  }

  if (member.isAdmin === true || member.isEditor === true) {
    return true;
  }

  if (modelAccessRoles.length === 0) {
    return true;
  }

  if (modelAccessRoles.some(x => member.tab.roles.includes(x)) === false) {
    return false;
  }

  return true;
}

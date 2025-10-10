import { MemberTab } from '~backend/drizzle/postgres/schema/_tabs';

export function checkModelAccess(item: {
  member: MemberTab;
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

  if (modelAccessRoles.some(x => member.roles.includes(x)) === false) {
    return false;
  }

  return true;
}

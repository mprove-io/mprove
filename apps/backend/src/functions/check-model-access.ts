import { MemberTab } from '~backend/drizzle/postgres/tabs/member-tab';

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

  if (modelAccessRoles.some(x => member.st.roles.includes(x)) === false) {
    return false;
  }

  return true;
}

import type { AccessRoleCombined } from '#common/zod/access-role-combined';

export function makeAccessRolesCombined(item: {
  accessRoles: string[];
  accessRolesInherited: AccessRoleCombined[];
}): AccessRoleCombined[] {
  let { accessRoles, accessRolesInherited } = item;

  let accessRolesSet = new Set(accessRoles ?? []);

  let roles = [
    ...(accessRoles ?? []),
    ...(accessRolesInherited ?? []).map(x => x.role)
  ];

  return [...new Set(roles)].map(role => ({
    role: role,
    isDirect: accessRolesSet.has(role)
  }));
}

export function makeDisplayAccessRoles(item: {
  accessRoles: string[];
  accessRolesCombined: string[];
}): { role: string; isDirect: boolean }[] {
  let { accessRoles, accessRolesCombined } = item;
  let accessRolesSet = new Set(accessRoles ?? []);

  return (accessRolesCombined ?? []).map(role => ({
    role: role,
    isDirect: accessRolesSet.has(role)
  }));
}

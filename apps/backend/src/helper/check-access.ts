import { entities } from '~backend/barrels/entities';

export function checkAccess(item: {
  userAlias: string;
  memberRoles: string[];
  vmd: entities.VizEntity | entities.ModelEntity | entities.DashboardEntity;
}): boolean {
  let { userAlias, memberRoles, vmd } = item;

  if (vmd.access_roles.length === 0 && vmd.access_users.length === 0) {
    return true;
  }

  if (
    vmd.access_users.indexOf(userAlias) < 0 &&
    !vmd.access_roles.some(x => memberRoles.includes(x))
  ) {
    return false;
  }

  return true;
}

import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { MemberEntity } from '~backend/models/store-entities/_index';

export function checkAccess(item: {
  userAlias: string;
  member: MemberEntity;
  vmd: entities.VizEntity | entities.ModelEntity | entities.DashboardEntity;
  checkExplorer?: boolean;
}): boolean {
  let { userAlias, member, vmd, checkExplorer } = item;

  if (checkExplorer === true && member.is_explorer === common.BoolEnum.FALSE) {
    return false;
  }

  if (
    member.is_admin === common.BoolEnum.TRUE ||
    member.is_editor === common.BoolEnum.TRUE
  ) {
    return true;
  }

  if (vmd.access_roles.length === 0 && vmd.access_users.length === 0) {
    return true;
  }

  if (
    vmd.access_users.indexOf(userAlias) < 0 &&
    !vmd.access_roles.some(x => member.roles.includes(x))
  ) {
    return false;
  }

  return true;
}

import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { MemberEntity } from '~backend/models/store-entities/_index';

export function checkAccess(item: {
  userAlias: string;
  member: MemberEntity;
  entity:
    | entities.VizEntity
    | entities.ModelEntity
    | entities.DashboardEntity
    | entities.RepEntity;
}): boolean {
  let { userAlias, member, entity } = item;

  if (
    common.isDefined((entity as entities.ModelEntity).connection_id) && // only models have connection_id
    member.is_explorer === common.BoolEnum.FALSE
  ) {
    return false;
  }

  if (
    member.is_admin === common.BoolEnum.TRUE ||
    member.is_editor === common.BoolEnum.TRUE
  ) {
    return true;
  }

  if (entity.access_roles.length === 0 && entity.access_users.length === 0) {
    return true;
  }

  if (
    entity.access_users.indexOf(userAlias) < 0 &&
    !entity.access_roles.some(x => member.roles.includes(x))
  ) {
    return false;
  }

  return true;
}

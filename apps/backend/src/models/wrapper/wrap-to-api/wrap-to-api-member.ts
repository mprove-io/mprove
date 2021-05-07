import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiMember(x: entities.MemberEntity): common.Member {
  return {
    projectId: x.project_id,
    memberId: x.member_id,
    email: x.email,
    alias: x.alias,
    firstName: x.first_name,
    lastName: x.last_name,
    fullName:
      common.isDefined(x.first_name) && common.isDefined(x.last_name)
        ? common.capitalizeFirstLetter(x.first_name) +
          ' ' +
          common.capitalizeFirstLetter(x.last_name)
        : common.isDefined(x.first_name)
        ? common.capitalizeFirstLetter(x.first_name)
        : common.isDefined(x.last_name)
        ? common.capitalizeFirstLetter(x.last_name)
        : undefined,
    avatarSmall: undefined,
    timezone: x.timezone,
    isAdmin: common.enumToBoolean(x.is_admin),
    isEditor: common.enumToBoolean(x.is_editor),
    isExplorer: common.enumToBoolean(x.is_explorer),
    roles: x.roles,
    serverTs: Number(x.server_ts)
  };
}

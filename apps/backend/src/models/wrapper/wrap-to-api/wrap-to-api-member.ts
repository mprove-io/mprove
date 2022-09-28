import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { makeFullName } from '~backend/functions/make-full-name';

export function wrapToApiMember(x: entities.MemberEntity): common.Member {
  return {
    projectId: x.project_id,
    memberId: x.member_id,
    email: x.email,
    alias: x.alias,
    firstName: x.first_name,
    lastName: x.last_name,
    fullName: makeFullName({ firstName: x.first_name, lastName: x.last_name }),
    avatarSmall: undefined,
    timezone: x.timezone,
    isAdmin: common.enumToBoolean(x.is_admin),
    isEditor: common.enumToBoolean(x.is_editor),
    isExplorer: common.enumToBoolean(x.is_explorer),
    roles: x.roles,
    envs: x.envs,
    serverTs: Number(x.server_ts)
  };
}

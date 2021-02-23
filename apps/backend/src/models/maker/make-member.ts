import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeMember(item: {
  projectId: string;
  user: entities.UserEntity;
  isEditor: common.BoolEnum;
  isAdmin: common.BoolEnum;
  isExplorer: common.BoolEnum;
}) {
  let memberEntity: entities.MemberEntity = {
    project_id: item.projectId,
    member_id: item.user.user_id,
    email: item.user.email,
    alias: item.user.alias,
    first_name: item.user.first_name,
    last_name: item.user.last_name,
    timezone: item.user.timezone,
    status: item.user.status,
    is_admin: item.isAdmin,
    is_editor: item.isEditor,
    is_explorer: item.isExplorer,
    server_ts: undefined
  };
  return memberEntity;
}

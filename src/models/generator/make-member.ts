import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export function makeMember(item: {
  user: entities.UserEntity;
  project_id: string;
  is_editor: enums.bEnum;
  is_admin: enums.bEnum;
}): entities.MemberEntity {
  return {
    member_id: item.user.user_id,
    project_id: item.project_id,
    alias: item.user.alias,
    first_name: item.user.first_name,
    last_name: item.user.last_name,
    picture_url_small: item.user.picture_url_small,
    picture_url_big: item.user.picture_url_big,
    status: item.user.status,
    is_editor: helper.isNotNullAndNotEmpty(item.is_editor)
      ? item.is_editor
      : enums.bEnum.FALSE,
    is_admin: helper.isNotNullAndNotEmpty(item.is_admin)
      ? item.is_admin
      : enums.bEnum.FALSE,
    deleted: enums.bEnum.FALSE,
    server_ts: '1'
  };
}

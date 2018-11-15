import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToApiMember(member: entities.MemberEntity): api.Member {
  return {
    member_id: member.member_id,
    project_id: member.project_id,
    alias: member.alias,
    first_name: member.first_name,
    last_name: member.last_name,
    picture_url_small: member.picture_url_small,
    picture_url_big: member.picture_url_big,
    status: <any>member.status, // any
    is_editor: helper.benumToBoolean(member.is_editor),
    is_admin: helper.benumToBoolean(member.is_admin),
    main_theme: member.main_theme,
    dash_theme: member.dash_theme,
    file_theme: member.file_theme,
    sql_theme: member.sql_theme,
    deleted: helper.benumToBoolean(member.deleted),
    server_ts: Number(member.server_ts)
  };
}

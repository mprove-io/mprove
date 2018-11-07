import * as apiEnums from '../../../enums/_index';

export interface EditMemberRequestBodyPayload {
  project_id: string;
  member_id: string;
  is_editor: boolean;
  is_admin: boolean;
  main_theme: apiEnums.MemberMainThemeEnum;
  dash_theme: apiEnums.MemberDashThemeEnum;
  file_theme: apiEnums.MemberFileThemeEnum;
  sql_theme: apiEnums.MemberSqlThemeEnum;
  server_ts: number;
}

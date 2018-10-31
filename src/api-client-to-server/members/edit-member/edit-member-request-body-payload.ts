import * as api from '../../../_index';

export interface EditMemberRequestBodyPayload {
  project_id: string;
  member_id: string;
  is_editor: boolean;
  is_admin: boolean;
  main_theme: api.MemberMainThemeEnum;
  dash_theme: api.MemberDashThemeEnum;
  file_theme: api.MemberFileThemeEnum;
  sql_theme: api.MemberSqlThemeEnum;
  server_ts: number;
}

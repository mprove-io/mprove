import * as api from '../_index';

export interface Member {
  project_id: string;
  member_id: string;
  alias: string;
  first_name: string;
  last_name: string;
  picture_url_small: string;
  picture_url_big: string;
  status: api.MemberStatusEnum;
  is_editor: boolean;
  is_admin: boolean;
  main_theme: api.MemberMainThemeEnum;
  dash_theme: api.MemberDashThemeEnum;
  file_theme: api.MemberFileThemeEnum;
  sql_theme: api.MemberSqlThemeEnum;
  deleted: boolean;
  server_ts: number;
}
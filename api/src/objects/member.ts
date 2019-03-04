import * as apiEnums from '../enums/_index';

export interface Member {
  project_id: string;
  member_id: string;
  alias: string;
  first_name: string;
  last_name: string;
  picture_url_small: string;
  picture_url_big: string;
  status: apiEnums.MemberStatusEnum;
  is_editor: boolean;
  is_admin: boolean;
  deleted: boolean;
  server_ts: number;
}

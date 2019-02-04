import * as apiEnums from '../enums/_index';

export interface User {
  user_id: string;
  user_track_id: string;
  alias: string;
  first_name: string;
  last_name: string;
  picture_url_small: string;
  picture_url_big: string;
  timezone: string;
  status: apiEnums.UserStatusEnum;
  main_theme: apiEnums.UserMainThemeEnum;
  dash_theme: apiEnums.UserDashThemeEnum;
  file_theme: apiEnums.UserFileThemeEnum;
  sql_theme: apiEnums.UserSqlThemeEnum;
  deleted: boolean;
  server_ts: number;
}

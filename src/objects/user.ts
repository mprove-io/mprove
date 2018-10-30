import * as api from '../_index';

export interface User {
  user_id: string;
  user_track_id: string;
  alias: string;
  first_name: string;
  last_name: string;
  picture_url_small: string;
  picture_url_big: string;
  timezone: string;
  status: api.UserStatusEnum;
  deleted: boolean;
  server_ts: number;
}

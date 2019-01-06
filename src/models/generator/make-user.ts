import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';
import { entities } from '../../barrels/entities';
import { helper } from '../../barrels/helper';

export function makeUser(item: {
  user_id: string;
  hash?: string;
  salt?: string;
  alias: string;
  status: api.UserStatusEnum;
}): entities.UserEntity {
  return {
    user_id: item.user_id,
    hash: item.hash,
    salt: item.salt,
    alias: item.alias,
    user_track_id: helper.makeId(),
    first_name: null,
    last_name: null,
    picture_url_small: undefined,
    picture_url_big: undefined,
    timezone: constants.USE_PROJECT_DEFAULT_TIMEZONE,
    status: item.status,
    server_ts: undefined
  };
}

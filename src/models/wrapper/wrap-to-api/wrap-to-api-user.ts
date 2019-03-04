import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';

export function wrapToApiUser(user: entities.UserEntity, deleted: enums.bEnum): api.User {

  return {
    user_id: user.user_id,
    user_track_id: user.user_track_id,
    alias: user.alias,
    first_name: user.first_name,
    last_name: user.last_name,
    picture_url_small: user.picture_url_small,
    picture_url_big: user.picture_url_big,
    timezone: user.timezone,
    status: user.status,
    deleted: helper.benumToBoolean(deleted),
    server_ts: Number(user.server_ts),
  };
}

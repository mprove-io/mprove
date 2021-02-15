import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiUser(user: entities.UserEntity): common.User {
  return {
    userId: user.user_id,
    email: user.email,
    alias: user.alias,
    firstName: user.first_name,
    lastName: user.last_name,
    avatarUrlBig: user.avatar_url_big,
    avatarUrlSmall: user.avatar_url_small,
    timezone: user.timezone,
    status: user.status,
    serverTs: Number(user.server_ts)
  };
}

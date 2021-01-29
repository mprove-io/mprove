import { api } from '~/barrels/api';
import { entities } from '~/barrels/entities';

export function wrapToApiUser(user: entities.UserEntity): api.User {
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

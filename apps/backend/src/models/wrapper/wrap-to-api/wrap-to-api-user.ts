import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiUser(user: entities.UserEntity): common.User {
  return {
    userId: user.user_id,
    email: user.email,
    alias: user.alias,
    firstName: user.first_name,
    lastName: user.last_name,
    timezone: user.timezone,
    status: user.status,
    isEmailVerified: common.enumToBoolean(user.is_email_verified),
    serverTs: Number(user.server_ts)
  };
}

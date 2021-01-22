import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { helper } from '../../barrels/helper';

export function makeUser(item: {
  userId: string;
  hash?: string;
  salt?: string;
  alias: string;
  isEmailVerified: api.BoolEnum;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpiresTs?: string;
}) {
  let userEntity: entities.UserEntity = {
    user_id: item.userId,
    password_reset_token: item.passwordResetToken,
    password_reset_expires_ts: item.passwordResetExpiresTs,
    is_email_verified: item.isEmailVerified,
    email_verification_token: item.emailVerificationToken || helper.makeId(),
    hash: item.hash,
    salt: item.salt,
    alias: item.alias,
    user_track_id: helper.makeId(),
    first_name: null,
    last_name: null,
    avatar_url_small: undefined,
    avatar_url_big: undefined,
    // timezone: constants.USE_PROJECT_DEFAULT_TIMEZONE,
    status: api.UserStatusEnum.Pending,
    server_ts: undefined
  };
  return userEntity;
}

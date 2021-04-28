import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeUser(item: {
  userId?: string;
  email: string;
  hash?: string;
  salt?: string;
  alias: string;
  isEmailVerified: common.BoolEnum;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpiresTs?: string;
}) {
  let userEntity: entities.UserEntity = {
    user_id: item.userId || common.makeId(),
    email: item.email,
    password_reset_token: item.passwordResetToken,
    password_reset_expires_ts: item.passwordResetExpiresTs,
    is_email_verified: item.isEmailVerified,
    email_verification_token: item.emailVerificationToken || common.makeId(),
    hash: item.hash,
    salt: item.salt,
    alias: item.alias,
    first_name: null,
    last_name: null,
    timezone: common.USE_PROJECT_TIMEZONE,
    server_ts: undefined
  };
  return userEntity;
}

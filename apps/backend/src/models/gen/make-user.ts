import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';

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
    user_id: item.userId || helper.makeId(),
    email: item.email,
    password_reset_token: item.passwordResetToken,
    password_reset_expires_ts: item.passwordResetExpiresTs,
    is_email_verified: item.isEmailVerified,
    email_verification_token: item.emailVerificationToken || helper.makeId(),
    hash: item.hash,
    salt: item.salt,
    alias: item.alias,
    first_name: null,
    last_name: null,
    avatar_url_small: undefined,
    avatar_url_big: undefined,
    timezone: common.USE_PROJECT_DEFAULT_TIMEZONE,
    status: apiToBackend.UserStatusEnum.Pending,
    server_ts: undefined
  };
  return userEntity;
}

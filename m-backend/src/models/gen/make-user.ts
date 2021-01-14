import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';

export function makeUser(item: {
  userId: string;
  hash?: string;
  salt?: string;
  alias: string;
  emailVerified: enums.bEnum;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpiresTs?: string;
  deleted?: enums.bEnum;
}): entities.UserEntity {
  return {
    user_id: item.userId,
    password_reset_token: item.passwordResetToken,
    password_reset_expires_ts: item.passwordResetExpiresTs,
    email_verified: item.emailVerified,
    email_verification_token: item.emailVerificationToken || helper.makeId(),
    hash: item.hash,
    salt: item.salt,
    alias: item.alias,
    user_track_id: helper.makeId(),
    first_name: null,
    last_name: null,
    small_avatar_url: undefined,
    big_avatar_url: undefined,
    // timezone: constants.USE_PROJECT_DEFAULT_TIMEZONE,
    status: api.UserStatusEnum.Pending,
    deleted: item.deleted || enums.bEnum.FALSE,
    server_ts: undefined
  };
}

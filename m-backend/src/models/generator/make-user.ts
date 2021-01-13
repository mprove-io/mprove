import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';

export function makeUser(item: {
  user_id: string;
  hash?: string;
  salt?: string;
  alias: string;
  email_verified: enums.bEnum;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires_ts?: string;
  deleted?: enums.bEnum;
}): entities.UserEntity {
  return {
    user_id: item.user_id,
    password_reset_token: item.password_reset_token,
    password_reset_expires_ts: item.password_reset_expires_ts,
    email_verified: item.email_verified,
    email_verification_token: item.email_verification_token || helper.makeId(),
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

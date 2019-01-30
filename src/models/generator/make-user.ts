import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';
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
}): entities.UserEntity {
  return {
    user_id: item.user_id,
    password_reset_expires_ts: undefined,
    password_reset_token: undefined,
    email_verified: item.email_verified,
    email_verification_token: item.email_verification_token || helper.makeId(),
    hash: item.hash,
    salt: item.salt,
    alias: item.alias,
    user_track_id: helper.makeId(),
    first_name: null,
    last_name: null,
    picture_url_small: undefined,
    picture_url_big: undefined,
    timezone: constants.USE_PROJECT_DEFAULT_TIMEZONE,
    status: api.UserStatusEnum.Pending,
    server_ts: undefined
  };
}

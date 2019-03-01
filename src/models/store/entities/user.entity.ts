// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_user')
export class UserEntity implements UserInterface {
  @PrimaryColumn({ type: constants.USER_ID_DATATYPE })
  user_id: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  email_verified: enums.bEnum;

  @Column({ unique: true, type: constants.USER_EMAIL_VERIFICATION_TOKEN })
  email_verification_token: string;

  @Column({
    unique: true,
    type: constants.PASSWORD_RESET_TOKEN,
    nullable: true
  })
  password_reset_token: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE, nullable: true })
  password_reset_expires_ts: string;

  @Column({ type: constants.USER_HASH_DATATYPE, nullable: true })
  hash: string;

  @Column({ type: constants.USER_SALT_DATATYPE, nullable: true })
  salt: string;

  @Column({ unique: true, type: constants.USER_TRACK_ID_DATATYPE })
  user_track_id: string;

  @Column({ unique: true, type: constants.USER_ALIAS_DATATYPE, nullable: true })
  alias: string;

  @Column({ type: constants.USER_FIRST_NAME_DATATYPE, nullable: true })
  first_name: string;

  @Column({ type: constants.USER_LAST_NAME_DATATYPE, nullable: true })
  last_name: string;

  @Column({ type: constants.USER_PICTURE_URL_SMALL_DATATYPE, nullable: true })
  picture_url_small: string;

  @Column({ type: constants.USER_PICTURE_URL_BIG_DATATYPE, nullable: true })
  picture_url_big: string;

  @Column({ type: constants.USER_TIMEZONE_DATATYPE, nullable: true })
  timezone: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  status: api.UserStatusEnum;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  main_theme: api.UserMainThemeEnum;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  dash_theme: api.UserDashThemeEnum;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  file_theme: api.UserFileThemeEnum;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  sql_theme: api.UserSqlThemeEnum;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  deleted: enums.bEnum;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}

interface UserInterface {
  user_id: api.User['user_id'];
  user_track_id: api.User['user_track_id'];
  alias: api.User['alias'];
  first_name: api.User['first_name'];
  last_name: api.User['last_name'];
  picture_url_small: api.User['picture_url_small'];
  picture_url_big: api.User['picture_url_big'];
  timezone: api.User['timezone'];
  status: api.User['status'];
  server_ts: any;
  // deleted: flag is for api only
}

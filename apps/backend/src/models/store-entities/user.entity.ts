import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: constants.USER_ID_VARCHAR, length: 32 })
  user_id: string;

  @Column({ unique: true, type: constants.USER_EMAIL_VARCHAR })
  email: string;

  @Column({ unique: true, type: constants.USER_ALIAS_VARCHAR, nullable: true })
  alias: string;

  @Column({ type: constants.VARCHAR })
  is_email_verified: common.BoolEnum;

  @Column({ unique: true, type: constants.VARCHAR })
  email_verification_token: string;

  @Column({ unique: true, type: constants.VARCHAR, nullable: true })
  password_reset_token: string;

  @Column({ type: constants.BIGINT, nullable: true })
  password_reset_expires_ts: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  hash: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  salt: string;

  @Column({ type: constants.USER_FIRST_NAME_VARCHAR, nullable: true })
  first_name: string;

  @Column({ type: constants.USER_LAST_NAME_VARCHAR, nullable: true })
  last_name: string;

  @Column({ type: constants.TIMEZONE_VARCHAR })
  timezone: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../barrels/api';
import { constants } from '../barrels/constants';
import { enums } from '../barrels/enums';

@Entity('user')
export class UserEntity {
  @PrimaryColumn({ type: constants.VARCHAR })
  user_id: string;

  @Column({ type: constants.VARCHAR })
  email_verified: enums.bEnum;

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

  @Column({ unique: true, type: constants.VARCHAR })
  user_track_id: string;

  @Column({ unique: true, type: constants.VARCHAR, nullable: true })
  alias: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  first_name: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  last_name: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  small_avatar_url: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  big_avatar_url: string;

  // @Column({ type: constants.USER_TIMEZONE_DATATYPE, nullable: true })
  // timezone: string;

  @Column({ type: constants.VARCHAR })
  status: api.UserStatusEnum;

  @Column({ type: constants.VARCHAR })
  deleted: enums.bEnum;

  // @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  // server_ts: string;
}

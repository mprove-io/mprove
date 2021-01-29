import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '~/barrels/api';
import { constants } from '~/barrels/constants';

@Entity('user')
export class UserEntity {
  @PrimaryColumn({ type: constants.VARCHAR })
  user_id: string;

  @Column({ unique: true, type: constants.VARCHAR })
  email: string;

  @Column({ unique: true, type: constants.VARCHAR, nullable: true })
  alias: string;

  @Column({ type: constants.VARCHAR })
  is_email_verified: api.BoolEnum;

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

  @Column({ type: constants.VARCHAR, nullable: true })
  first_name: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  last_name: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  avatar_url_small: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  avatar_url_big: string;

  @Column({ type: constants.VARCHAR })
  timezone: string;

  @Column({ type: constants.VARCHAR })
  status: api.UserStatusEnum;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

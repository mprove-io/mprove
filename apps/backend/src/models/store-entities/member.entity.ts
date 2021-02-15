import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('members')
export class MemberEntity {
  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string; // composite

  @PrimaryColumn({ type: constants.USER_ID_VARCHAR })
  member_id: string; // user_id

  @Column({ type: constants.USER_EMAIL_VARCHAR })
  email: string;

  @Column({ type: constants.USER_ALIAS_VARCHAR, nullable: true })
  alias: string;

  @Column({ type: constants.USER_FIRST_NAME_VARCHAR, nullable: true })
  first_name: string;

  @Column({ type: constants.USER_LAST_NAME_VARCHAR, nullable: true })
  last_name: string;

  @Column({ type: constants.USER_AVATAR_URL_SMALL_VARCHAR, nullable: true })
  avatar_url_small: string;

  @Column({ type: constants.USER_AVATAR_URL_BIG_VARCHAR, nullable: true })
  avatar_url_big: string;

  @Column({ type: constants.TIMEZONE_VARCHAR })
  timezone: string;

  @Column({ type: constants.USER_STATUS_VARCHAR })
  status: common.UserStatusEnum; // MemberStatusEnum

  @Column({ type: constants.VARCHAR })
  is_admin: common.BoolEnum;

  @Column({ type: constants.VARCHAR })
  is_editor: common.BoolEnum;

  @Column({ type: constants.VARCHAR })
  is_explorer: common.BoolEnum;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

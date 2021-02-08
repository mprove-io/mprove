import { Column, Entity, PrimaryColumn } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('member')
export class MemberEntity {
  @PrimaryColumn({ type: constants.VARCHAR })
  member_id: string; // user_id

  @PrimaryColumn({ type: constants.VARCHAR })
  project_id: string;

  @Column({ unique: true, type: constants.VARCHAR, nullable: true })
  alias: string;

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
  status: apiToBackend.UserStatusEnum; // MemberStatusEnum

  @Column({ type: constants.VARCHAR })
  is_editor: common.BoolEnum;

  @Column({ type: constants.VARCHAR })
  is_admin: common.BoolEnum;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

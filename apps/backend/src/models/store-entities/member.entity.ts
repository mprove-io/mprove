import { Column, Entity, PrimaryColumn } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('members')
export class MemberEntity {
  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string; // composite

  @PrimaryColumn({ type: constants.MEMBER_ID_VARCHAR })
  member_id: string; // user_id

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

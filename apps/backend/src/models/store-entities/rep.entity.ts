import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('reps')
export class RepEntity {
  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR, length: 32 })
  project_id: string; // composite

  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR, length: 32 })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.REP_ID_VARCHAR, length: 64 })
  rep_id: string; // name

  @Column({ type: constants.VARCHAR })
  draft: common.BoolEnum;

  @Column({ type: constants.USER_ID_VARCHAR, length: 32, nullable: true })
  creator_id: string; // user_id

  @Column({ type: constants.TEXT, nullable: true })
  file_path: string;

  @Column({ type: constants.VARCHAR })
  title: string;

  @Column({ type: constants.JSON })
  rows: common.Row[];

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

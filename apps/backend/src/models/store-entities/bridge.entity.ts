import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('bridges')
export class BridgeEntity {
  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string; // composite

  @PrimaryColumn({ type: constants.REPO_ID_VARCHAR })
  repo_id: string; // composite

  @PrimaryColumn({ type: constants.BRANCH_ID_VARCHAR })
  branch_id: string; // name

  @PrimaryColumn({ type: constants.ENV_ID_VARCHAR })
  env_id: string; // name

  @Column({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string;

  @Column({ type: constants.VARCHAR })
  need_validate: common.BoolEnum;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

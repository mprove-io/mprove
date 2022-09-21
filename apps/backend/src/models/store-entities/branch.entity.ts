import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('branches')
export class BranchEntity {
  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR, length: 32 })
  project_id: string; // composite

  @PrimaryColumn({ type: constants.REPO_ID_VARCHAR, length: 32 })
  repo_id: string; // composite

  @PrimaryColumn({ type: constants.BRANCH_ID_VARCHAR, length: 32 })
  branch_id: string; // name

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

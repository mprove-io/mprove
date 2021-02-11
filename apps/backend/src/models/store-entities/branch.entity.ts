import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('branches')
export class BranchEntity {
  @Column({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string;

  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string; // composite

  @PrimaryColumn({ type: constants.BRANCH_ID_VARCHAR })
  branch_id: string; // name

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('projects')
export class ProjectEntity {
  @PrimaryColumn({ type: constants.ORG_ID_VARCHAR })
  org_id: string;

  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string;

  @Column({ type: constants.VARCHAR })
  name: string; // name is unique across org projects

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // has_credentials: enums.bEnum;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

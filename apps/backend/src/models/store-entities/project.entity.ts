import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('projects')
export class ProjectEntity {
  @PrimaryColumn({ type: constants.ORG_ID_VARCHAR })
  org_id: string;

  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string;

  @Column({ type: constants.VARCHAR })
  name: string; // name is unique across org projects

  @Column({ type: constants.VARCHAR, default: common.BRANCH_MASTER })
  default_branch: string;

  @Column({
    type: constants.VARCHAR,
    default: common.ProjectRemoteTypeEnum.Managed
  })
  remote_type: common.ProjectRemoteTypeEnum;

  @Column({ type: constants.VARCHAR, nullable: true })
  git_url: string;

  @Column({ type: constants.TEXT, nullable: true })
  public_key: string;

  @Column({ type: constants.TEXT, nullable: true })
  private_key: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // has_credentials: enums.bEnum;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

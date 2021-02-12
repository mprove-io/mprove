import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('projects')
export class ProjectEntity {
  @Column({ type: constants.ORG_ID_VARCHAR })
  org_id: string;

  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string;

  @Column({ type: constants.VARCHAR })
  name: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // has_credentials: enums.bEnum;

  @Column({ type: constants.VARCHAR })
  week_start: common.ProjectWeekStartEnum;

  @Column({ type: constants.TIMEZONE_VARCHAR })
  timezone: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

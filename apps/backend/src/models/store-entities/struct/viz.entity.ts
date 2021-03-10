import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('vizs')
export class VizEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.VISUALIZATION_ID_VARCHAR })
  viz_id: string; // name

  @Column({ type: constants.TEXT, nullable: true })
  file_path: string;

  @Column({ type: constants.JSON })
  access_users: string[];

  @Column({ type: constants.JSON })
  access_roles: string[];

  @Column({ type: constants.VARCHAR, nullable: true })
  gr: string;

  @Column({ type: constants.VARCHAR })
  hidden: common.BoolEnum;

  @Column({ type: constants.JSON })
  reports: common.Report[];

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

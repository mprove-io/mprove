import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('dashboards')
export class DashboardEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.DASHBOARD_ID_VARCHAR })
  dashboard_id: string; // name

  @Column({ type: constants.JSON })
  content: any;

  @Column({ type: constants.JSON })
  access_users: string[];

  @Column({ type: constants.JSON })
  access_roles: string[];

  @Column({ type: constants.TEXT, nullable: true })
  title: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  gr: string;

  @Column({ type: constants.VARCHAR })
  hidden: common.BoolEnum;

  @Column({ type: constants.JSON })
  fields: common.DashboardField[];

  @Column({ type: constants.JSON })
  reports: common.Report[];

  @Column({ type: constants.VARCHAR })
  temp: common.BoolEnum;

  @Column({ type: constants.TEXT, nullable: true })
  description: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

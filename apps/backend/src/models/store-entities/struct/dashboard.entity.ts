import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('dashboards')
export class DashboardEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.DASHBOARD_ID_VARCHAR })
  dashboard_id: string; // name

  // @PrimaryColumn({ type: constants.REPO_ID_DATATYPE })
  // repo_id: string;

  // @Column({ type: constants.DASHBOARD_CONTENT_DATATYPE })
  // content: string;

  // @Column({ type: constants.DASHBOARD_ACCESS_USERS_DATATYPE })
  // access_users: string;

  // @Column({ type: constants.DASHBOARD_TITLE_DATATYPE, nullable: true })
  // title: string;

  // @Column({ type: constants.DASHBOARD_GR_DATATYPE, nullable: true })
  // gr: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // hidden: enums.bEnum;

  // @Column({ type: constants.DASHBOARD_FIELDS_DATATYPE })
  // fields: string;

  // @Column({ type: constants.DASHBOARD_REPORTS_DATATYPE })
  // reports: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // temp: enums.bEnum;

  // @Column({ type: constants.DASHBOARD_DESCRIPTION_DATATYPE, nullable: true })
  // description: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

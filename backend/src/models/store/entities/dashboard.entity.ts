// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_dashboard')
export class DashboardEntity implements DashboardInterface {
  @PrimaryColumn({ type: constants.DASHBOARD_ID_DATATYPE })
  dashboard_id: string;

  @PrimaryColumn({ type: constants.PROJECT_ID_DATATYPE })
  project_id: string;

  @PrimaryColumn({ type: constants.REPO_ID_DATATYPE })
  repo_id: string;

  @Column({ type: constants.STRUCT_ID_DATATYPE })
  struct_id: string;

  @Column({ type: constants.DASHBOARD_CONTENT_DATATYPE })
  content: string;

  @Column({ type: constants.DASHBOARD_ACCESS_USERS_DATATYPE })
  access_users: string;

  @Column({ type: constants.DASHBOARD_TITLE_DATATYPE, nullable: true })
  title: string;

  @Column({ type: constants.DASHBOARD_GR_DATATYPE, nullable: true })
  gr: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  hidden: enums.bEnum;

  @Column({ type: constants.DASHBOARD_FIELDS_DATATYPE })
  fields: string;

  @Column({ type: constants.DASHBOARD_REPORTS_DATATYPE })
  reports: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  temp: enums.bEnum;

  @Column({ type: constants.DASHBOARD_DESCRIPTION_DATATYPE, nullable: true })
  description: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}

interface DashboardInterface extends api.Dashboard {
  access_users: any;
  hidden: any;
  fields: any;
  reports: any;
  temp: any;
  server_ts: any;
}

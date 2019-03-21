// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_mconfig')
export class MconfigEntity {
  @PrimaryColumn({ type: constants.MCONFIG_ID_DATATYPE })
  mconfig_id: string;

  @Column({ type: constants.QUERY_ID_DATATYPE })
  query_id: string;

  @Column({ type: constants.PROJECT_ID_DATATYPE })
  project_id: string;

  @Column({ type: constants.REPO_ID_DATATYPE })
  repo_id: string;

  @Column({ type: constants.STRUCT_ID_DATATYPE })
  struct_id: string;

  @Column({ type: constants.MODEL_ID_DATATYPE })
  model_id: string;

  @Column({ type: constants.MCONFIG_SELECT_DATATYPE })
  select: string;

  @Column({ type: constants.MCONFIG_SORTINGS_DATATYPE })
  sortings: string;

  @Column({ type: constants.MCONFIG_SORTS_DATATYPE, nullable: true })
  sorts: string;

  @Column({ type: constants.MCONFIG_TIMEZONE_DATATYPE })
  timezone: string;

  @Column({ type: constants.MCONFIG_LIMIT_DATATYPE })
  limit: number;

  @Column({ type: constants.MCONFIG_FILTERS_DATATYPE })
  filters: string;

  @Column({ type: constants.MCONFIG_CHARTS_DATATYPE })
  charts: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  temp: enums.bEnum;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}

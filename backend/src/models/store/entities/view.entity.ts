// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_view')
export class ViewEntity {
  @PrimaryColumn({ type: constants.VIEW_ID_DATATYPE })
  view_id: string;

  @PrimaryColumn({ type: constants.PROJECT_ID_DATATYPE })
  project_id: string;

  @PrimaryColumn({ type: constants.REPO_ID_DATATYPE })
  repo_id: string;

  @Column({ type: constants.STRUCT_ID_DATATYPE })
  struct_id: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  is_pdt: enums.bEnum;

  @Column({ type: constants.VIEW_DEPS_DATATYPE })
  view_deps: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}

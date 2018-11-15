// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';

@Entity('m_error')
export class ErrorEntity implements ErrorInterface {
  @PrimaryColumn({ type: constants.ERROR_ID_DATATYPE })
  error_id: string;

  @Column({ type: constants.PROJECT_ID_DATATYPE })
  project_id: string;

  @Column({ type: constants.REPO_ID_DATATYPE })
  repo_id: string;

  @Column({ type: constants.STRUCT_ID_DATATYPE })
  struct_id: string;

  @Column({ type: constants.ERROR_TYPE_DATATYPE })
  type: string;

  @Column({ type: constants.ERROR_MESSAGE_DATATYPE })
  message: string;

  @Column({ type: constants.ERROR_LINES_DATATYPE })
  lines: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}

interface ErrorInterface extends api.SwError {
  lines: any;
  server_ts: any;
}

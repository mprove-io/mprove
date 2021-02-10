import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('errors')
export class ErrorEntity {
  @Column({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string;

  @PrimaryColumn({ type: constants.ERROR_ID_VARCHAR })
  error_id: string;

  // @Column({ type: constants.REPO_ID_DATATYPE })
  // repo_id: string;

  // @Column({ type: constants.STRUCT_ID_DATATYPE })
  // struct_id: string;

  // @Column({ type: constants.ERROR_TYPE_DATATYPE })
  // type: string;

  // @Column({ type: constants.ERROR_MESSAGE_DATATYPE })
  // message: string;

  // @Column({ type: constants.ERROR_LINES_DATATYPE })
  // lines: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

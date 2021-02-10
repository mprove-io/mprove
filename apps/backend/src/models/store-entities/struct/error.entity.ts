import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('errors')
export class ErrorEntity {
  @Column({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string;

  @PrimaryColumn({ type: constants.ERROR_ID_VARCHAR })
  error_id: string;

  @Column({ type: constants.VARCHAR })
  type: string;

  @Column({ type: constants.TEXT })
  message: string;

  @Column({ type: constants.TEXT })
  lines: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

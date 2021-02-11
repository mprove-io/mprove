import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('structs')
export class StructEntity {
  @Column({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string;

  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string;

  @Column({ type: constants.TEXT })
  errors: string;

  @Column({ type: constants.TEXT })
  udfs_dict: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

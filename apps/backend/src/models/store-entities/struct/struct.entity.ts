import { Column, Entity, PrimaryColumn } from 'typeorm';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { constants } from '~backend/barrels/constants';

@Entity('structs')
export class StructEntity {
  @Column({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string;

  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string;

  @Column({ type: constants.JSON })
  errors: apiToBlockml.BmlError[];

  @Column({ type: constants.JSON })
  udfs_dict: apiToBlockml.UdfsDict;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

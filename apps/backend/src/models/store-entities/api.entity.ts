import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('apis')
export class ApiEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR, length: 32 })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.API_ID_VARCHAR, length: 32 })
  api_id: string; // name

  @Column({ type: constants.TEXT })
  file_path: string;

  @Column({ type: constants.VARCHAR })
  label: string;

  @Column({ type: constants.JSON })
  steps: any[];

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

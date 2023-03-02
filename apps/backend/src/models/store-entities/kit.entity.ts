import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('kit')
export class KitEntity {
  @Column({ type: constants.STRUCT_ID_VARCHAR, length: 32 })
  struct_id: string;

  @Column({ type: constants.REP_ID_VARCHAR, length: 64 })
  rep_id: string;

  @PrimaryColumn({ type: constants.KIT_ID_VARCHAR, length: 32 })
  kit_id: string;

  @Column({ type: constants.JSON })
  data: any;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

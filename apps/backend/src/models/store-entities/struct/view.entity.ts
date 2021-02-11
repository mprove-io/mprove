import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('views')
export class ViewEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.VIEW_ID_VARCHAR })
  view_id: string; // name

  @Column({ type: constants.JSON })
  view_deps: string[];

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

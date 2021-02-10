import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('visualizations')
export class VisualizationEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.VISUALIZATION_ID_VARCHAR })
  visualization_id: string; // name

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

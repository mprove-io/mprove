import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('evs')
export class EvEntity {
  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR, length: 32 })
  project_id: string; // composite

  @PrimaryColumn({ type: constants.ENV_ID_VARCHAR, length: 32 })
  env_id: string; // name

  @PrimaryColumn({ type: constants.EV_ID_VARCHAR, length: 128 })
  ev_id: string; // name

  @Column({ type: constants.VARCHAR, nullable: true })
  val: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}

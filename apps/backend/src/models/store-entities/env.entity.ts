import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('envs')
export class EnvEntity {
  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string; // composite

  @PrimaryColumn({ type: constants.ENV_ID_VARCHAR })
  env_id: string; // name

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
